export type AppRole = "customer" | "merchant" | "admin";

export type OnboardingStep = 1 | 2 | 3 | 4;

export const APP_ROUTES = {
  landing: "/",
  books: "/books",
  about: "/about",
  contact: "/contact",
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  onboardingRoot: "/onboarding",
  onboardingStep1: "/onboarding/step-1",
  onboardingStep2: "/onboarding/step-2",
  onboardingStep3: "/onboarding/step-3",
  onboardingComplete: "/onboarding/complete",
  completeAccount: "/onboarding/step-1",
  customerHome: "/customer",
  customerBooks: "/customer/books",
  customerWishlist: "/customer/wishlist",
  customerCart: "/customer/cart",
  customerOrders: "/customer/orders",
  customerProfile: "/customer/profile",
  customerSettings: "/customer/settings",
  merchantHome: "/merchant",
  merchantBooks: "/merchant/books",
  merchantNewBook: "/merchant/books/new",
  merchantOrders: "/merchant/orders",
  merchantAnalytics: "/merchant/analytics",
  merchantSettings: "/merchant/store-settings",
  adminHome: "/admin",
  adminUsers: "/admin/users",
  adminMerchants: "/admin/merchants",
  adminBooks: "/admin/books",
  adminCategories: "/admin/categories",
  adminReviews: "/admin/reviews",
  adminAnalytics: "/admin/analytics",
  account: "/account",
} as const;

export const PUBLIC_PORTAL_ROLES = ["customer", "merchant"] as const;

type RoleConfig = {
  role: AppRole;
  label: string;
  shortLabel: string;
  appName: string;
  headline: string;
  description: string;
  homePath: string;
};

export const ROLE_CONFIG: Record<AppRole, RoleConfig> = {
  customer: {
    role: "customer",
    label: "Customer",
    shortLabel: "Reader Space",
    appName: "Groxy Reader",
    headline: "Discover books with a curated, premium storefront",
    description:
      "Search, browse, save to wishlist, place orders, and manage your personal reading profile.",
    homePath: APP_ROUTES.customerHome,
  },
  merchant: {
    role: "merchant",
    label: "Merchant",
    shortLabel: "Seller Studio",
    appName: "Groxy Merchant",
    headline: "Run your bookstore with a calm, conversion-focused workspace",
    description:
      "Manage inventory, pricing, orders, store settings, media, and sales performance in one place.",
    homePath: APP_ROUTES.merchantHome,
  },
  admin: {
    role: "admin",
    label: "Admin",
    shortLabel: "Control Room",
    appName: "Groxy Admin",
    headline: "Operate the marketplace with clear structure and control",
    description:
      "Review users, approve merchants, organize categories, monitor reviews, and watch growth signals.",
    homePath: APP_ROUTES.adminHome,
  },
};

export const PUBLIC_NAV = [
  { label: "Books", href: APP_ROUTES.books },
  { label: "About", href: APP_ROUTES.about },
  { label: "Contact", href: APP_ROUTES.contact },
] as const;

export const CUSTOMER_NAV = [
  { label: "Overview", href: APP_ROUTES.customerHome },
  { label: "Books", href: APP_ROUTES.customerBooks },
  { label: "Wishlist", href: APP_ROUTES.customerWishlist },
  { label: "Cart", href: APP_ROUTES.customerCart },
  { label: "Orders", href: APP_ROUTES.customerOrders },
  { label: "Profile", href: APP_ROUTES.customerProfile },
  { label: "Settings", href: APP_ROUTES.customerSettings },
] as const;

export const MERCHANT_NAV = [
  { label: "Overview", href: APP_ROUTES.merchantHome },
  { label: "Books", href: APP_ROUTES.merchantBooks },
  { label: "Add Book", href: APP_ROUTES.merchantNewBook },
  { label: "Orders", href: APP_ROUTES.merchantOrders },
  { label: "Analytics", href: APP_ROUTES.merchantAnalytics },
  { label: "Store Settings", href: APP_ROUTES.merchantSettings },
] as const;

export const ADMIN_NAV = [
  { label: "Overview", href: APP_ROUTES.adminHome },
  { label: "Users", href: APP_ROUTES.adminUsers },
  { label: "Merchants", href: APP_ROUTES.adminMerchants },
  { label: "Books", href: APP_ROUTES.adminBooks },
  { label: "Categories", href: APP_ROUTES.adminCategories },
  { label: "Reviews", href: APP_ROUTES.adminReviews },
  { label: "Analytics", href: APP_ROUTES.adminAnalytics },
] as const;

export function isAppRole(value: string | null | undefined): value is AppRole {
  return value === "customer" || value === "merchant" || value === "admin";
}

export function getRoleConfig(role: AppRole) {
  return ROLE_CONFIG[role];
}

export function getRoleHome(role: AppRole | null | undefined) {
  if (!role) return APP_ROUTES.onboardingStep1;
  return ROLE_CONFIG[role].homePath;
}

export function getOnboardingPath(step: number | null | undefined) {
  switch (step) {
    case 2:
      return APP_ROUTES.onboardingStep2;
    case 3:
      return APP_ROUTES.onboardingStep3;
    case 4:
      return APP_ROUTES.onboardingComplete;
    case 1:
    default:
      return APP_ROUTES.onboardingStep1;
  }
}

export function getRoleCompletionPath(role?: AppRole | null) {
  if (!role) return APP_ROUTES.onboardingStep1;
  return `${APP_ROUTES.onboardingStep2}?role=${role}`;
}

export function canRoleAccessPath(path: string | null | undefined, role: AppRole) {
  if (!path || !path.startsWith("/")) return false;
  const home = getRoleHome(role);
  return path === home || path.startsWith(`${home}/`);
}

export function getRoleFromPath(pathname: string): AppRole | null {
  if (pathname.startsWith(APP_ROUTES.adminHome) || pathname.startsWith("/api/admin")) {
    return "admin";
  }
  if (pathname.startsWith(APP_ROUTES.merchantHome) || pathname.startsWith("/api/merchant")) {
    return "merchant";
  }
  if (pathname.startsWith(APP_ROUTES.customerHome)) {
    return "customer";
  }
  return null;
}

export function getPortalSignInPath(pathname: string) {
  if (pathname.startsWith(APP_ROUTES.adminHome) || pathname.startsWith("/api/admin")) {
    return `${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.adminHome)}`;
  }
  if (pathname.startsWith(APP_ROUTES.merchantHome) || pathname.startsWith("/api/merchant")) {
    return `${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.merchantHome)}`;
  }
  if (pathname.startsWith(APP_ROUTES.customerHome)) {
    return `${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.customerHome)}`;
  }
  return APP_ROUTES.signIn;
}
