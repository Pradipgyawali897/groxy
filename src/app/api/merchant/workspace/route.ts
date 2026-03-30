import { NextResponse } from "next/server";

import { merchantSetupSchema } from "@/lib/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = merchantSetupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid store settings." },
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

  const { data: existing } = await supabase
    .from("merchant_workspaces")
    .select("user_id")
    .eq("store_slug", parsed.data.store_slug)
    .neq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "That store slug is already taken." }, { status: 409 });
  }

  const { error } = await supabase.from("merchant_workspaces").upsert({
    user_id: user.id,
    store_name: parsed.data.store_name,
    store_slug: parsed.data.store_slug,
    description: parsed.data.description,
    logo_url: parsed.data.logo_url || null,
    banner_url: parsed.data.banner_url || null,
    support_email: user.email ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
