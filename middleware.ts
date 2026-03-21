import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/merchant", "/customer", "/api/merchant", "/service"];
const authRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

function parseAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isMerchantRoute = pathname.startsWith("/merchant") || pathname.startsWith("/api/merchant");
  const isCustomerRoute = pathname.startsWith("/customer");
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/service/select";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute) {
    const allowlist = parseAdminEmails();
    const email = user?.email?.toLowerCase();
    if (!user || !email || !allowlist.includes(email)) {
      const url = request.nextUrl.clone();
      url.pathname = user ? "/dashboard" : "/sign-in";
      if (!user) {
        url.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(url);
    }
  }

  if (user && (isMerchantRoute || isCustomerRoute)) {
    const [customerRole, merchantRole] = await Promise.all([
      supabase
        .from("customer_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("merchant_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (isCustomerRoute && !customerRole.data) {
      const url = request.nextUrl.clone();
      url.pathname = "/service/select";
      url.searchParams.set("intent", "customer");
      return NextResponse.redirect(url);
    }

    if (isMerchantRoute && !merchantRole.data) {
      const url = request.nextUrl.clone();
      url.pathname = "/service/select";
      url.searchParams.set("intent", "merchant");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
