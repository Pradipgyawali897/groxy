import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getEffectiveOnboardingStep } from "@/lib/onboarding-progress";
import { ensureProfileRecord } from "@/lib/profile";
import { normalizeNextPath, resolvePostAuthRedirect } from "@/lib/redirects";
import { APP_ROUTES, isAppRole } from "@/lib/roles";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL_OTP_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const satisfies readonly EmailOtpType[];

type AuthCallbackFlow = "default" | "recovery";

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && EMAIL_OTP_TYPES.some((candidate) => candidate === value);
}

function getRecoveryNext(next: string | null) {
  return normalizeNextPath(next, { allowResetPassword: true });
}

function getCallbackFlow(next: string | null, authType: EmailOtpType | null): AuthCallbackFlow {
  const recoveryPath = getRecoveryNext(next)?.split("?")[0] ?? null;
  return authType === "recovery" || recoveryPath === APP_ROUTES.resetPassword ? "recovery" : "default";
}

function getCallbackError(url: URL) {
  return (
    url.searchParams.get("error_description") ??
    url.searchParams.get("error") ??
    url.searchParams.get("error_code")
  );
}

function redirectToAuthEntry(
  url: URL,
  {
    flow,
    next,
    error,
  }: {
    flow: AuthCallbackFlow;
    next: string | null;
    error?: string | null;
  }
) {
  const redirectUrl = new URL(flow === "recovery" ? APP_ROUTES.forgotPassword : APP_ROUTES.signIn, url.origin);
  const safeNext = normalizeNextPath(next);

  if (flow !== "recovery" && safeNext) {
    redirectUrl.searchParams.set("next", safeNext);
  }

  if (error) {
    redirectUrl.searchParams.set("error", error);
  }

  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const typeParam = url.searchParams.get("type");
  const authType = isEmailOtpType(typeParam) ? typeParam : null;
  const flow = getCallbackFlow(next, authType);
  const callbackError = getCallbackError(url);

  if (callbackError) {
    return redirectToAuthEntry(url, {
      flow,
      next,
      error: callbackError,
    });
  }

  if (!code && !(tokenHash && authType)) {
    return redirectToAuthEntry(url, {
      flow,
      next,
      error: "This authentication link is invalid or incomplete.",
    });
  }

  const supabase = await createSupabaseServerClient();
  const authError =
    tokenHash && authType
      ? (await supabase.auth.verifyOtp({ token_hash: tokenHash, type: authType })).error
      : (await supabase.auth.exchangeCodeForSession(code as string)).error;

  if (authError) {
    return redirectToAuthEntry(url, {
      flow,
      next,
      error: authError.message,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToAuthEntry(url, {
      flow,
      next,
      error: "Authentication completed, but no user session was found.",
    });
  }

  await ensureProfileRecord(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,avatar_url,role,is_onboarded,onboarding_step")
    .eq("id", user.id)
    .maybeSingle();

  const role = isAppRole(profile?.role) ? profile.role : null;
  const isOnboarded = Boolean(profile?.is_onboarded);
  const onboardingStep = getEffectiveOnboardingStep({ user, profile });
  const canAccessAdmin = role === "admin" || isAdminEmail(user.email);

  const target = resolvePostAuthRedirect({
    next,
    role,
    isOnboarded,
    onboardingStep,
    canAccessAdmin,
    flow,
  });

  return NextResponse.redirect(new URL(target, url.origin));
}
