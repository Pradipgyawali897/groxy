import { APP_ROUTES, type AppRole, getAuthedPath, getOnboardingPath, getRoleFromPath } from "@/lib/roles";

type NormalizeNextPathOptions = {
  allowResetPassword?: boolean;
};

function isUnsafePrefix(pathname: string, options: NormalizeNextPathOptions = {}) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith(APP_ROUTES.signIn) ||
    pathname.startsWith(APP_ROUTES.signUp) ||
    pathname.startsWith(APP_ROUTES.forgotPassword) ||
    (!options.allowResetPassword && pathname.startsWith(APP_ROUTES.resetPassword)) ||
    pathname.startsWith(APP_ROUTES.onboardingRoot)
  );
}

/**
 * Normalizes a user-controlled `next` value into a safe internal path.
 * - Only allows same-origin, internal paths starting with `/`.
 * - Preserves querystring.
 * - Rejects protocol-relative or absolute URLs.
 */
export function normalizeNextPath(next: string | null | undefined, options: NormalizeNextPathOptions = {}) {
  if (!next) return null;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//")) return null;
  if (trimmed.includes("\n") || trimmed.includes("\r")) return null;

  try {
    const url = new URL(trimmed, "http://internal");
    const pathname = url.pathname;
    if (isUnsafePrefix(pathname, options)) return null;
    return `${pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function resolvePostAuthRedirect({
  next,
  role,
  isOnboarded,
  onboardingStep,
  canAccessAdmin = false,
  flow = "default",
}: {
  next: string | null | undefined;
  role: AppRole | null;
  isOnboarded: boolean;
  onboardingStep: number;
  canAccessAdmin?: boolean;
  flow?: "default" | "recovery";
}) {
  const safeNext = normalizeNextPath(next, {
    allowResetPassword: flow === "recovery",
  });

  if (flow === "recovery") {
    const recoveryPath = safeNext?.split("?")[0] ?? safeNext;
    return recoveryPath === APP_ROUTES.resetPassword && safeNext ? safeNext : APP_ROUTES.resetPassword;
  }

  if (!isOnboarded) {
    return getOnboardingPath(onboardingStep);
  }

  if (!safeNext) {
    return getAuthedPath({ role, isOnboarded, canAccessAdmin });
  }

  const pathname = safeNext.split("?")[0] ?? safeNext;
  const requiredRole = getRoleFromPath(pathname);
  if (requiredRole === "admin" && canAccessAdmin) {
    return safeNext;
  }
  if (requiredRole && requiredRole !== role) {
    return getAuthedPath({ role, isOnboarded, canAccessAdmin });
  }

  return safeNext;
}
