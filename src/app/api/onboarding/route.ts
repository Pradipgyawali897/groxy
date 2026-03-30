import { NextResponse } from "next/server";

import { ensureProfileRecord } from "@/lib/profile";
import { onboardingPayloadSchema } from "@/lib/onboarding";
import { APP_ROUTES, getAuthedPath, getOnboardingPath, isAppRole } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = onboardingPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid onboarding data." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureProfileRecord(user);

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role,is_onboarded,onboarding_step")
    .eq("id", user.id)
    .maybeSingle();

  if (currentProfile?.is_onboarded && parsed.data.step !== "complete") {
    return NextResponse.json({
      ok: true,
      next: getAuthedPath({
        role: isAppRole(currentProfile.role) ? currentProfile.role : null,
        isOnboarded: true,
      }),
    });
  }

  if (parsed.data.step === "basic") {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.data.full_name,
        avatar_url: parsed.data.data.avatar_url || null,
        onboarding_step: 2,
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, next: APP_ROUTES.onboardingStep2 });
  }

  if (parsed.data.step === "role") {
    const { error } = await supabase
      .from("profiles")
      .update({
        role: parsed.data.data.role,
        onboarding_step: 3,
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, next: APP_ROUTES.onboardingStep3 });
  }

  if (parsed.data.step === "customer") {
    const { error: prefError } = await supabase.from("customer_preferences").upsert({
      user_id: user.id,
      favorite_genres: parsed.data.data.favorite_genres,
      reading_interests: parsed.data.data.reading_interests,
      newsletter_opt_in: parsed.data.data.newsletter_opt_in,
    });

    if (prefError) {
      return NextResponse.json({ error: prefError.message }, { status: 400 });
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "customer", onboarding_step: 4 })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    await supabase.from("carts").upsert({ user_id: user.id }, { onConflict: "user_id" });
    await supabase.from("wishlists").upsert({ user_id: user.id }, { onConflict: "user_id" });

    return NextResponse.json({ ok: true, next: APP_ROUTES.onboardingComplete });
  }

  if (parsed.data.step === "merchant") {
    const { data: existingSlug } = await supabase
      .from("merchant_workspaces")
      .select("user_id")
      .eq("store_slug", parsed.data.data.store_slug)
      .neq("user_id", user.id)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: "That store slug is already taken." },
        { status: 409 }
      );
    }

    const { error: workspaceError } = await supabase.from("merchant_workspaces").upsert({
      user_id: user.id,
      store_name: parsed.data.data.store_name,
      store_slug: parsed.data.data.store_slug,
      description: parsed.data.data.description,
      logo_url: parsed.data.data.logo_url || null,
      banner_url: parsed.data.data.banner_url || null,
      support_email: user.email ?? null,
      approved: false,
    });

    if (workspaceError) {
      return NextResponse.json({ error: workspaceError.message }, { status: 400 });
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "merchant", onboarding_step: 4 })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, next: APP_ROUTES.onboardingComplete });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,onboarding_step")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.role) {
    return NextResponse.json(
      { error: "Choose a role before finishing onboarding." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_onboarded: true, onboarding_step: 4 })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    next: getAuthedPath({
      role: isAppRole(profile.role) ? profile.role : null,
      isOnboarded: true,
    }),
    onboardingNext: getOnboardingPath(profile.onboarding_step),
  });
}
