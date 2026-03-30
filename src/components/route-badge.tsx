"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function labelForPath(pathname: string) {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/books/")) return "Book details";
  if (pathname.startsWith("/books")) return "Catalog";
  if (pathname.startsWith("/categories/")) return "Category";
  if (pathname.startsWith("/authors/")) return "Author";

  if (pathname.startsWith("/customer/recommendations")) return "Customer: For you";
  if (pathname.startsWith("/customer/recently-viewed")) return "Customer: Recently viewed";
  if (pathname.startsWith("/customer/wishlist")) return "Customer: Wishlist";
  if (pathname.startsWith("/customer/cart")) return "Customer: Cart";
  if (pathname.startsWith("/customer/orders")) return "Customer: Orders";
  if (pathname.startsWith("/customer/profile")) return "Customer: Profile";
  if (pathname.startsWith("/customer/settings")) return "Customer: Settings";
  if (pathname.startsWith("/customer")) return "Customer";

  if (pathname.startsWith("/merchant/books/new")) return "Merchant: New listing";
  if (pathname.startsWith("/merchant/books/")) return "Merchant: Edit listing";
  if (pathname.startsWith("/merchant/books")) return "Merchant: Listings";
  if (pathname.startsWith("/merchant/orders")) return "Merchant: Orders";
  if (pathname.startsWith("/merchant/analytics")) return "Merchant: Analytics";
  if (pathname.startsWith("/merchant/store-settings")) return "Merchant: Store settings";
  if (pathname.startsWith("/merchant")) return "Merchant";

  if (pathname.startsWith("/admin/users")) return "Admin: Users";
  if (pathname.startsWith("/admin/merchants")) return "Admin: Merchants";
  if (pathname.startsWith("/admin/books")) return "Admin: Books";
  if (pathname.startsWith("/admin/categories")) return "Admin: Categories";
  if (pathname.startsWith("/admin/reviews")) return "Admin: Reviews";
  if (pathname.startsWith("/admin/analytics")) return "Admin: Analytics";
  if (pathname.startsWith("/admin")) return "Admin";

  if (pathname.startsWith("/sign-in")) return "Sign in";
  if (pathname.startsWith("/sign-up")) return "Create account";
  if (pathname.startsWith("/forgot-password")) return "Password reset";
  if (pathname.startsWith("/reset-password")) return "New password";
  if (pathname.startsWith("/onboarding")) return "Onboarding";
  if (pathname.startsWith("/about")) return "About";
  if (pathname.startsWith("/contact")) return "Contact";
  if (pathname.startsWith("/account")) return "Account";

  return "Page";
}

export function RouteBadge() {
  const pathname = usePathname();
  const label = React.useMemo(() => labelForPath(pathname), [pathname]);

  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/80">
      {label}
    </span>
  );
}
