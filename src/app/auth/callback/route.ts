import { NextResponse } from "next/server";

import { ensureProfileRecord } from "@/lib/profile";
import { APP_ROUTES, canRoleAccessPath, getOnboardingPath, getRoleHome, isAppRole } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL(APP_ROUTES.signIn, url.origin));
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.exchangeCodeForSession(code);

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

  const target = isOnboarded
    ? role && canRoleAccessPath(next, role)
      ? next!
      : getRoleHome(role)
    : getOnboardingPath(onboardingStep);

  return NextResponse.redirect(new URL(target, url.origin));
}
