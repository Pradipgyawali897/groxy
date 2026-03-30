"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon, User, LayoutDashboard, Heart, Sparkles, BookOpenText, ChartNoAxesColumn, Users, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isActivePath } from "@/lib/navigation";
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
          { label: "Listings", href: APP_ROUTES.merchantBooks, icon: BookOpenText },
          { label: "Analytics", href: APP_ROUTES.merchantAnalytics, icon: ChartNoAxesColumn },
        ]
      : role === "admin" || canAccessAdmin
        ? [
            { label: "Users", href: APP_ROUTES.adminUsers, icon: Users },
            { label: "Books", href: APP_ROUTES.adminBooks, icon: BookOpenText },
          ]
        : [
            { label: "Wishlist", href: APP_ROUTES.customerWishlist, icon: Heart },
            { label: "For you", href: APP_ROUTES.customerRecommendations, icon: Sparkles },
            { label: "Cart", href: APP_ROUTES.customerCart, icon: ShoppingCart },
          ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" className="h-10 rounded-xl px-3">
          <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">
            {initials(email)}
          </span>
          <span className="hidden text-sm sm:inline">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>
          <div className="px-1">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Signed in</p>
            <p className="mt-1 truncate text-sm font-medium">{email ?? "Account"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push(dashboardHref)}
          className={isActivePath(pathname, dashboardHref) ? "cursor-pointer bg-muted" : "cursor-pointer"}
        >
          <LayoutDashboard />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(APP_ROUTES.account)}
          className={isActivePath(pathname, APP_ROUTES.account) ? "cursor-pointer bg-muted" : "cursor-pointer"}
        >
          <User />
          Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {quickLinks.map((item) => (
          <DropdownMenuItem
            key={item.href}
            onClick={() => router.push(item.href)}
            className={isActivePath(pathname, item.href) ? "cursor-pointer bg-muted" : "cursor-pointer"}
          >
            <item.icon />
            {item.label}
          </DropdownMenuItem>
        ))}
        {canAccessAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(APP_ROUTES.adminHome)}
              className={isActivePath(pathname, APP_ROUTES.adminHome) ? "cursor-pointer bg-muted" : "cursor-pointer"}
            >
              <LayoutDashboard />
              Admin
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
