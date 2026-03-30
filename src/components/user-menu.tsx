"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon, User, LayoutDashboard, Heart, Sparkles, BookOpenText, ChartNoAxesColumn, Users, ShoppingCart, ArrowRight, ChevronDown, ShieldCheck, Store } from "lucide-react";

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

function roleBadgeLabel(role: AppRole | null, canAccessAdmin: boolean) {
  if (role === "merchant") return "Merchant";
  if (role === "customer") return "Reader";
  if (role === "admin" || canAccessAdmin) return "Admin";
  return "Account";
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
  const accountLabel = roleBadgeLabel(role, canAccessAdmin);
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
          variant="ghost"
          size="icon"
          className={cn("rounded-full", open && "bg-muted")}
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {initials(email)}
          </div>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col gap-1 p-2">
          <div className="px-2 py-1.5 mb-2 border-b border-border/40">
            <p className="text-sm font-medium">{email ?? "Account"}</p>
            <p className="text-xs text-muted-foreground capitalize">{accountLabel}</p>
          </div>

          <div className="grid gap-1 mb-2 border-b border-border/40 pb-2">
            <InteractiveLink
              href={dashboardHref}
              onClick={() => close()}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </InteractiveLink>
            <InteractiveLink
              href={APP_ROUTES.account}
              onClick={() => close()}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ShieldCheck className="size-4" />
              Account Settings
            </InteractiveLink>
          </div>

          <div className="grid gap-1 mb-2 border-b border-border/40 pb-2">
            {quickLinks.map((item) => (
              <InteractiveLink
                key={item.href}
                href={item.href}
                onClick={() => close()}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </InteractiveLink>
            ))}
          </div>

          <button
            type="button"
            onClick={async () => {
              close();
              await onSignOut();
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOutIcon className="size-4 relative top-0.5" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </HeaderDropdown>
  );
}
