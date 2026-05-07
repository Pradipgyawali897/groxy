import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

import { getEffectiveOnboardingStep } from "@/lib/onboarding-progress";
import {
  APP_ROUTES,
  getAuthedPath,
  getOnboardingPath,
  getRoleFromPath,
  getRoleHome,
  isAppRole,
} from "@/lib/roles";
import { isAdminEmail } from "@/lib/admin-allowlist";

const authRoutes = [
  APP_ROUTES.signIn,
  APP_ROUTES.signUp,
  APP_ROUTES.forgotPassword,
];
type CookieSet = {
  name: string;
  value: string;
  options?: ResponseCookie;
}[];
const onboardingRoutes = [
  APP_ROUTES.onboardingRoot,
  APP_ROUTES.onboardingStep1,
  APP_ROUTES.onboardingStep2,
  APP_ROUTES.onboardingStep3,
  APP_ROUTES.onboardingComplete,
];

const protectedPrefixes = [
  APP_ROUTES.account,
  APP_ROUTES.customerHome,
  APP_ROUTES.merchantHome,
  APP_ROUTES.adminHome,
  "/api/onboarding",
  "/api/merchant",
  "/api/admin",
];

function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isOnboardingRoute(pathname: string) {
  return onboardingRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function buildSignInRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = APP_ROUTES.signIn;
  url.search = "";
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return url;
}

function buildRoleRedirect(
  request: NextRequest,
  pathname: string,
  role: string | null,
  canAccessAdmin: boolean
) {
  const url = request.nextUrl.clone();
  const nextRole = isAppRole(role) ? role : null;
  url.pathname = nextRole
    ? getRoleHome(nextRole)
    : getAuthedPath({ role: null, isOnboarded: true, canAccessAdmin });
  url.search = "";
  return url;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  
  // CORS configuration
  const origin = request.headers.get("origin");
  const allowedOrigins = ["https://groxy-blush.vercel.app"];
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Supabase-Auth");
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedRoute(pathname) || isOnboardingRoute(pathname)) {
      return NextResponse.redirect(buildSignInRedirect(request));
    }
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,avatar_url,role,is_onboarded,onboarding_step")
    .eq("id", user.id)
    .maybeSingle();

  const role = isAppRole(profile?.role) ? profile.role : null;
  const canAccessAdmin = role === "admin" || isAdminEmail(user.email);
  const isOnboarded = Boolean(profile?.is_onboarded);
  const onboardingStep = getEffectiveOnboardingStep({ user, profile });
  const requiredRole = getRoleFromPath(pathname);

  if (isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = getAuthedPath({ role, isOnboarded, canAccessAdmin });
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!isOnboarded) {
    if (!isOnboardingRoute(pathname) && isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = getOnboardingPath(onboardingStep);
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (isOnboardingRoute(pathname)) {
      const normalizedTarget = getOnboardingPath(onboardingStep);
      if (pathname !== normalizedTarget) {
        const url = request.nextUrl.clone();
        url.pathname = normalizedTarget;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    return response;
  }

  if (isOnboardingRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = getAuthedPath({ role, isOnboarded, canAccessAdmin });
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (requiredRole && role !== requiredRole) {
    if (requiredRole === "admin" && canAccessAdmin) {
      return response;
    }
    return NextResponse.redirect(buildRoleRedirect(request, pathname, role, canAccessAdmin));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
