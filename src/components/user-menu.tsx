"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon, User, LayoutDashboard, Heart, Sparkles, BookOpenText, ChartNoAxesColumn, Users, ShoppingCart, ArrowRight } from "lucide-react";

import { HeaderDropdown } from "@/components/header-dropdown";
import { InteractiveLink } from "@/components/interactive-link";
import { Button } from "@/components/ui/button";
import { isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { APP_ROUTES, type AppRole, getAuthedPath } from "@/lib/roles";

function initials(email?: string | null) {
  if (!email) return "U";
  const name = email.split("@")[0] ?? "U";
  return name.slice(0, 2).toUpperCase();
}

export function UserMenu({
  email,
  role,
  isOnboarded,
  canAccessAdmin,
}: {
  email?: string | null;
  role: AppRole | null;
  isOnboarded: boolean;
  canAccessAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const onSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(APP_ROUTES.signIn);
    router.refresh();
  };

  const dashboardHref = getAuthedPath({ role, isOnboarded, canAccessAdmin });
  const quickLinks =
    role === "merchant"
      ? [
          { label: "Listings", href: APP_ROUTES.merchantBooks, icon: BookOpenText, caption: "Manage inventory" },
          { label: "Analytics", href: APP_ROUTES.merchantAnalytics, icon: ChartNoAxesColumn, caption: "Performance signals" },
        ]
      : role === "admin" || canAccessAdmin
        ? [
            { label: "Users", href: APP_ROUTES.adminUsers, icon: Users, caption: "Roles and access" },
            { label: "Books", href: APP_ROUTES.adminBooks, icon: BookOpenText, caption: "Catalog controls" },
          ]
        : [
            { label: "Wishlist", href: APP_ROUTES.customerWishlist, icon: Heart, caption: "Saved books" },
            { label: "For you", href: APP_ROUTES.customerRecommendations, icon: Sparkles, caption: "Personalized picks" },
            { label: "Cart", href: APP_ROUTES.customerCart, icon: ShoppingCart, caption: "Current basket" },
          ];

  return (
    <HeaderDropdown
      align="end"
      panelClassName="w-[min(22rem,calc(100vw-2rem))]"
      trigger={({ open, toggle }) => (
        <Button
          variant="outline"
          className={isActivePath(pathname, APP_ROUTES.account) || open ? "h-10 rounded-xl px-3 bg-muted text-foreground" : "h-10 rounded-xl px-3"}
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">
            {initials(email)}
          </span>
          <span className="hidden text-sm sm:inline">Account</span>
        </Button>
      )}
    >
      {({ close }) => (
        <div className="space-y-2">
          <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Signed in</p>
            <p className="mt-2 truncate text-sm font-medium">{email ?? "Account"}</p>
            <InteractiveLink
              href={dashboardHref}
              onClick={() => close()}
              className="mt-4 flex items-center justify-between rounded-[1rem] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              <span>Open workspace</span>
              <ArrowRight className="size-4" />
            </InteractiveLink>
          </div>

          <div className="space-y-1">
            <p className="px-2 pt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Account</p>
            <InteractiveLink
              href={dashboardHref}
              onClick={() => close()}
              className={cn(
                "flex items-start gap-3 rounded-[1rem] px-3 py-3 hover:bg-muted",
                isActivePath(pathname, dashboardHref) && "bg-muted"
              )}
            >
              <LayoutDashboard className="size-4" />
              <div>
                <p className="text-sm font-medium">Dashboard</p>
                <p className="text-xs text-muted-foreground">Your main workspace</p>
              </div>
            </InteractiveLink>
            <InteractiveLink
              href={APP_ROUTES.account}
              onClick={() => close()}
              className={cn(
                "flex items-start gap-3 rounded-[1rem] px-3 py-3 hover:bg-muted",
                isActivePath(pathname, APP_ROUTES.account) && "bg-muted"
              )}
            >
              <User className="size-4" />
              <div>
                <p className="text-sm font-medium">Account center</p>
                <p className="text-xs text-muted-foreground">Profile and security</p>
              </div>
            </InteractiveLink>
          </div>

          <div className="space-y-1">
            <p className="px-2 pt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Quick access</p>
            {quickLinks.map((item) => (
              <InteractiveLink
                key={item.href}
                href={item.href}
                onClick={() => close()}
                className={cn(
                  "flex items-start gap-3 rounded-[1rem] px-3 py-3 hover:bg-muted",
                  isActivePath(pathname, item.href) && "bg-muted"
                )}
              >
                <item.icon className="size-4" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.caption}</p>
                </div>
              </InteractiveLink>
            ))}
            {canAccessAdmin ? (
              <InteractiveLink
                href={APP_ROUTES.adminHome}
                onClick={() => close()}
                className={cn(
                  "flex items-start gap-3 rounded-[1rem] px-3 py-3 hover:bg-muted",
                  isActivePath(pathname, APP_ROUTES.adminHome) && "bg-muted"
                )}
              >
                <LayoutDashboard className="size-4" />
                <div>
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">Marketplace controls</p>
                </div>
              </InteractiveLink>
            ) : null}
          </div>

          <button
            type="button"
            onClick={async () => {
              close();
              await onSignOut();
            }}
            className="flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
          >
            <LogOutIcon className="size-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </HeaderDropdown>
  );
}
