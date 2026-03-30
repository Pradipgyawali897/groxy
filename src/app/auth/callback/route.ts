import { NextResponse } from "next/server";

import { ensureProfileRecord } from "@/lib/profile";
import { resolvePostAuthRedirect } from "@/lib/redirects";
import { APP_ROUTES, isAppRole } from "@/lib/roles";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error") ?? url.searchParams.get("error_description");
  if (error) {
    const redirectUrl = new URL(APP_ROUTES.signIn, url.origin);
    redirectUrl.searchParams.set("error", error);
    return NextResponse.redirect(redirectUrl);
  }

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  if (!code) {
    const redirectUrl = new URL(APP_ROUTES.signIn, url.origin);
    if (next) redirectUrl.searchParams.set("next", next);
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    const redirectUrl = new URL(APP_ROUTES.signIn, url.origin);
    redirectUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(redirectUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(APP_ROUTES.signIn, url.origin));
  }

  await ensureProfileRecord(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_onboarded,onboarding_step")
    .eq("id", user.id)
    .maybeSingle();

  const role = isAppRole(profile?.role) ? profile.role : null;
  const isOnboarded = Boolean(profile?.is_onboarded);
  const onboardingStep = profile?.onboarding_step ?? 1;
  const canAccessAdmin = role === "admin" || isAdminEmail(user.email);

  const target = resolvePostAuthRedirect({
    next,
    role,
    isOnboarded,
    onboardingStep,
    canAccessAdmin,
  });

  return NextResponse.redirect(new URL(target, url.origin));
}
