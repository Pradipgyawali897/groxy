"use client";

import { Menu, BookOpenText, LayoutDashboard, Sparkles, Heart, User2 } from "lucide-react";
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
  const dashboardHref = user ? (isOnboarded ? getRoleHome(role) : APP_ROUTES.onboardingStep1) : APP_ROUTES.signIn;

  const quickLinks =
    role === "merchant"
      ? [
          { href: APP_ROUTES.merchantBooks, label: "Listings", icon: BookOpenText },
          { href: APP_ROUTES.merchantAnalytics, label: "Analytics", icon: Sparkles },
        ]
      : role === "admin"
        ? [
            { href: APP_ROUTES.adminUsers, label: "Users", icon: User2 },
            { href: APP_ROUTES.adminBooks, label: "Books", icon: BookOpenText },
          ]
        : [
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
            <div className="px-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Navigate</p>
              <p className="mt-1 text-sm font-medium">Current: {pathname}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PUBLIC_NAV.map((item) => (
            <DropdownMenuItem
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn("cursor-pointer", pathname.startsWith(item.href) && item.href !== "/" && "bg-muted")}
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
              {quickLinks.map((item) => (
                <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)} className="cursor-pointer">
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

