"use client";

import { Menu, BookOpenText, House, LayoutDashboard, Sparkles, Heart, User2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { labelForPath } from "@/components/route-badge";
import { APP_ROUTES, PUBLIC_NAV, type AppRole, getRoleHome } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function SiteMenu({
  user,
  role,
  isOnboarded,
}: {
  user: boolean;
  role: AppRole | null;
  isOnboarded: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLabel = labelForPath(pathname);
  const dashboardHref = user ? (isOnboarded ? getRoleHome(role) : APP_ROUTES.onboardingStep1) : APP_ROUTES.signIn;

  const quickLinks =
    role === "merchant"
      ? [
          { href: APP_ROUTES.merchantHome, label: "Overview", icon: LayoutDashboard },
          { href: APP_ROUTES.merchantBooks, label: "Listings", icon: BookOpenText },
          { href: APP_ROUTES.merchantAnalytics, label: "Analytics", icon: Sparkles },
        ]
      : role === "admin"
        ? [
            { href: APP_ROUTES.adminHome, label: "Overview", icon: LayoutDashboard },
            { href: APP_ROUTES.adminUsers, label: "Users", icon: User2 },
            { href: APP_ROUTES.adminBooks, label: "Books", icon: BookOpenText },
          ]
        : [
            { href: APP_ROUTES.customerHome, label: "Overview", icon: LayoutDashboard },
            { href: APP_ROUTES.customerRecommendations, label: "For you", icon: Sparkles },
            { href: APP_ROUTES.customerWishlist, label: "Wishlist", icon: Heart },
          ];

  return (
    <div className="lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon-lg" className="rounded-xl">
              <Menu className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent className="w-72">
          <DropdownMenuLabel>
            <div className="space-y-2 px-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                <House className="size-3.5" />
                {currentLabel}
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Navigate</p>
              <p className="text-sm font-medium">Move through storefront and workspace faster.</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PUBLIC_NAV.map((item) => (
            <DropdownMenuItem
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "cursor-pointer",
                (pathname === item.href || pathname.startsWith(`${item.href}/`)) && "bg-muted"
              )}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(APP_ROUTES.books)} className="cursor-pointer">
            <BookOpenText />
            Browse books
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(dashboardHref)} className="cursor-pointer">
            <LayoutDashboard />
            {user ? "Open dashboard" : "Sign in"}
          </DropdownMenuItem>
          {user ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Workspace
              </DropdownMenuLabel>
              {quickLinks.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "cursor-pointer",
                    (pathname === item.href || pathname.startsWith(`${item.href}/`)) && "bg-muted"
                  )}
                >
                  <item.icon />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
