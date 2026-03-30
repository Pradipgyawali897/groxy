"use client";

import { Menu, BookOpenText, House, LayoutDashboard, Sparkles, Heart, User2, ShoppingCart, Info, Mail, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

import { HeaderDropdown } from "@/components/header-dropdown";
import { InteractiveLink } from "@/components/interactive-link";
import { Button } from "@/components/ui/button";
import { labelForPath } from "@/components/route-badge";
import { isActivePath } from "@/lib/navigation";
import { APP_ROUTES, PUBLIC_NAV, type AppRole, getAuthedPath } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function SiteMenu({
  user,
  role,
  isOnboarded,
  canAccessAdmin = false,
}: {
  user: boolean;
  role: AppRole | null;
  isOnboarded: boolean;
  canAccessAdmin?: boolean;
}) {
  const pathname = usePathname();
  const currentLabel = labelForPath(pathname);
  const dashboardHref = user
    ? getAuthedPath({ role, isOnboarded, canAccessAdmin })
    : APP_ROUTES.signIn;

  const publicLinks = [
    { href: APP_ROUTES.landing, label: "Home", icon: House, caption: "Return to storefront home" },
    { href: APP_ROUTES.books, label: "Books", icon: BookOpenText, caption: "Browse every title" },
    { href: APP_ROUTES.about, label: "About", icon: Info, caption: "See how the store works" },
    { href: APP_ROUTES.contact, label: "Contact", icon: Mail, caption: "Reach the team" },
  ] as const;

  const quickLinks =
    role === "merchant"
      ? [
          { href: APP_ROUTES.merchantHome, label: "Overview", icon: LayoutDashboard, caption: "Store snapshot" },
          { href: APP_ROUTES.merchantBooks, label: "Listings", icon: BookOpenText, caption: "Manage books" },
          { href: APP_ROUTES.merchantAnalytics, label: "Analytics", icon: Sparkles, caption: "Performance signals" },
        ]
      : role === "admin"
        ? [
            { href: APP_ROUTES.adminHome, label: "Overview", icon: LayoutDashboard, caption: "Control room" },
            { href: APP_ROUTES.adminUsers, label: "Users", icon: User2, caption: "Access and roles" },
            { href: APP_ROUTES.adminBooks, label: "Books", icon: BookOpenText, caption: "Catalog oversight" },
          ]
        : [
            { href: APP_ROUTES.customerHome, label: "Overview", icon: LayoutDashboard, caption: "Reader dashboard" },
            { href: APP_ROUTES.customerRecommendations, label: "For you", icon: Sparkles, caption: "Personalized picks" },
            { href: APP_ROUTES.customerWishlist, label: "Wishlist", icon: Heart, caption: "Saved books" },
            { href: APP_ROUTES.customerCart, label: "Cart", icon: ShoppingCart, caption: "Ready to buy" },
          ];

  return (
    <div className="lg:hidden">
      <HeaderDropdown
        align="start"
        panelClassName="w-[min(22rem,calc(100vw-2rem))]"
        trigger={({ open, toggle }) => (
          <Button
            variant="outline"
            className={cn(
              "h-10 rounded-xl px-3",
              open && "bg-muted text-foreground"
            )}
            onClick={toggle}
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <Menu className="size-4" />
            <span className="text-sm">Menu</span>
          </Button>
        )}
      >
        {({ close }) => (
          <div className="space-y-2">
            <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                <House className="size-3.5" />
                {currentLabel}
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Navigation</p>
              <p className="mt-2 text-sm font-medium">Move through the storefront and workspace without guessing where to go.</p>
            </div>

            <div className="space-y-1">
              <p className="px-2 pt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Storefront</p>
              {publicLinks.map((item) => (
                <InteractiveLink
                  key={item.href}
                  href={item.href}
                  onClick={() => close()}
                  className={cn(
                    "flex items-start gap-3 rounded-[1rem] px-3 py-3 hover:bg-muted",
                    isActivePath(pathname, item.href) && "bg-muted"
                  )}
                >
                  <item.icon />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.caption}</p>
                  </div>
                </InteractiveLink>
              ))}
            </div>

            {user ? (
              <div className="space-y-1">
                <p className="px-2 pt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Workspace</p>
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
                    <item.icon />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.caption}</p>
                    </div>
                  </InteractiveLink>
                ))}
              </div>
            ) : null}

            <InteractiveLink
              href={dashboardHref}
              onClick={() => close()}
              className="mt-2 flex items-center justify-between rounded-[1rem] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              <span>{user ? "Open dashboard" : "Sign in to continue"}</span>
              <ArrowRight className="size-4" />
            </InteractiveLink>
          </div>
        )}
      </HeaderDropdown>
    </div>
  );
}
