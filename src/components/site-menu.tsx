"use client";

import { Menu, BookOpenText, House, LayoutDashboard, Sparkles, Heart, User2, ShoppingCart, Info, Mail, ArrowRight, Compass, PanelsTopLeft } from "lucide-react";
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
    <HeaderDropdown
      align="start"
      panelClassName="w-[min(24rem,calc(100vw-1.5rem))]"
      trigger={({ open, toggle }) => (
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", open && "bg-muted")}
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col gap-1 p-2">
          {user ? (
            <div className="mb-2 px-2 pb-2 border-b border-border/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Workspace</p>
              <div className="grid gap-1">
                {quickLinks.map((item) => (
                  <InteractiveLink
                    key={item.href}
                    href={item.href}
                    onClick={() => close()}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                      isActivePath(pathname, item.href) ? "bg-muted text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </InteractiveLink>
                ))}
              </div>
            </div>
          ) : null}

          <div className="px-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Storefront</p>
            <div className="grid gap-1">
              {publicLinks.map((item) => (
                <InteractiveLink
                  key={item.href}
                  href={item.href}
                  onClick={() => close()}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                    isActivePath(pathname, item.href) ? "bg-muted text-foreground" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </InteractiveLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </HeaderDropdown>
  );
}
