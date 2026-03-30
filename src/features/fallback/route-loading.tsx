"use client";

import { usePathname } from "next/navigation";

import SpinnerLoading from "@/components/skeleton_loader/spinner";
import {
  AccountPageSkeleton,
  AdminCollectionSkeleton,
  AuthPageSkeleton,
  BookDetailSkeleton,
  CatalogListSkeleton,
  DashboardCollectionSkeleton,
  DashboardEditorSkeleton,
  DashboardOverviewSkeleton,
  InformationalPageSkeleton,
  LandingPageSkeleton,
  OnboardingPageSkeleton,
} from "@/features/fallback/page-loading";

export function RouteLoading() {
  const pathname = usePathname();

  if (pathname === "/") {
    return <LandingPageSkeleton />;
  }

  if (pathname.startsWith("/books/")) {
    return <BookDetailSkeleton />;
  }

  if (pathname.startsWith("/books") || pathname.startsWith("/authors") || pathname.startsWith("/categories")) {
    return <CatalogListSkeleton />;
  }

  if (pathname.startsWith("/about") || pathname.startsWith("/contact")) {
    return <InformationalPageSkeleton />;
  }

  if (pathname.startsWith("/account")) {
    return <AccountPageSkeleton />;
  }

  if (pathname.startsWith("/customer/recommendations")) {
    return <DashboardCollectionSkeleton surface="Recommended shelf" />;
  }

  if (
    pathname.startsWith("/customer/recently-viewed") ||
    pathname.startsWith("/customer/wishlist") ||
    pathname.startsWith("/customer/books")
  ) {
    return <DashboardCollectionSkeleton surface="Reader shelves" />;
  }

  if (
    pathname.startsWith("/customer/orders") ||
    pathname.startsWith("/customer/profile") ||
    pathname.startsWith("/customer/settings") ||
    pathname.startsWith("/customer/cart")
  ) {
    return <DashboardEditorSkeleton surface="Customer workspace" />;
  }

  if (pathname.startsWith("/customer")) {
    return <DashboardOverviewSkeleton surface="Customer workspace" />;
  }

  if (pathname.startsWith("/merchant/books/new") || pathname.startsWith("/merchant/books/")) {
    return <DashboardEditorSkeleton surface="Merchant editor" />;
  }

  if (pathname.startsWith("/merchant/books") || pathname.startsWith("/merchant/orders")) {
    return <DashboardCollectionSkeleton surface="Merchant operations" />;
  }

  if (pathname.startsWith("/merchant/store-settings")) {
    return <DashboardEditorSkeleton surface="Store setup" />;
  }

  if (pathname.startsWith("/merchant")) {
    return <DashboardOverviewSkeleton surface="Merchant studio" />;
  }

  if (
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/merchants") ||
    pathname.startsWith("/admin/books") ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/reviews") ||
    pathname.startsWith("/admin/analytics")
  ) {
    return <AdminCollectionSkeleton surface="Admin control room" />;
  }

  if (pathname.startsWith("/admin")) {
    return <DashboardOverviewSkeleton surface="Admin control room" />;
  }

  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return <AuthPageSkeleton />;
  }

  if (pathname.startsWith("/onboarding")) {
    return <OnboardingPageSkeleton />;
  }

  return <SpinnerLoading />;
}
