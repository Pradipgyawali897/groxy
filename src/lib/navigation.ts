import { APP_ROUTES } from "@/lib/roles";

const EXACT_ONLY_PATHS = new Set<string>([
  APP_ROUTES.landing,
  APP_ROUTES.customerHome,
  APP_ROUTES.merchantHome,
  APP_ROUTES.adminHome,
]);

export function isActivePath(pathname: string, href: string) {
  if (EXACT_ONLY_PATHS.has(href)) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
