import type { Metadata } from "next";

import { GroxyLogo } from "@/components/groxy-logo";
import { CustomerQuickLinks } from "@/components/customer-quick-links";
import { InteractiveLink } from "@/components/interactive-link";
import { ModeToggle } from "@/components/mode-toggle";
import { PublicNav } from "@/components/public-nav";
import { RouteTitleSync } from "@/components/route-title-sync";
import { SiteMenu } from "@/components/site-menu";
import { UserMenu } from "@/components/user-menu";
import { RouteBadge } from "@/components/route-badge";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath } from "@/lib/roles";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Groxy Books",
    template: "%s | Groxy Books",
  },
  description: "Premium online bookstore and marketplace built for readers, merchants, and operators.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, role, isOnboarded, canAccessAdmin } = await getViewerContext();
  const dashboardHref = user
    ? getAuthedPath({ role, isOnboarded, canAccessAdmin })
    : APP_ROUTES.signIn;
  const footerAccessLinks = user
    ? [
        {
          href: dashboardHref,
          label: isOnboarded ? "Open dashboard" : "Continue onboarding",
        },
        {
          href: APP_ROUTES.account,
          label: "Account center",
        },
        canAccessAdmin
          ? { href: APP_ROUTES.adminHome, label: "Admin control room" }
          : role === "merchant"
            ? { href: APP_ROUTES.merchantBooks, label: "Manage listings" }
            : role === "customer"
              ? { href: APP_ROUTES.customerWishlist, label: "Wishlist" }
              : { href: APP_ROUTES.books, label: "Browse catalog" },
      ]
    : [
        { href: APP_ROUTES.signIn, label: "Sign in" },
        { href: APP_ROUTES.signUp, label: "Create account" },
        { href: APP_ROUTES.merchantHome, label: "Merchant studio" },
      ];

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="theme min-h-full bg-background text-foreground">
        <ThemeProvider>
          <RouteTitleSync />
          <div className="flex min-h-full flex-col">
            <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="flex items-center gap-3">
                    <SiteMenu
                      user={Boolean(user)}
                      role={role}
                      isOnboarded={isOnboarded}
                      canAccessAdmin={canAccessAdmin}
                    />
                    <GroxyLogo />
                  </div>
                  <PublicNav className="hidden md:flex" />
                </div>
                
                <div className="flex items-center justify-end gap-2 sm:gap-4">
                  {user && role === "customer" && isOnboarded ? (
                    <CustomerQuickLinks className="hidden xl:flex" />
                  ) : null}
                  
                  <div className="hidden items-center sm:flex">
                    <ModeToggle />
                  </div>
                  
                  <InteractiveLink
                    href={dashboardHref}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                    pendingClassName="opacity-80"
                  >
                    {user ? (isOnboarded ? "Dashboard" : "Onboarding") : "Sign In"}
                  </InteractiveLink>

                  {user ? (
                    <UserMenu
                      email={user.email}
                      role={role}
                      isOnboarded={isOnboarded}
                      canAccessAdmin={canAccessAdmin}
                    />
                  ) : null}
                </div>
              </div>
            </header>
            <div className="flex-1">{children}</div>
            <footer className="border-t border-border/70 bg-foreground text-background">
              <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_0.8fr_0.8fr] lg:px-8">
                <div className="space-y-4">
                  <div className="flex">
                    <GroxyLogo mybackground="different" dimenssion={{ width: 120, height: 120 }} />
                  </div>
                  <p className="max-w-md text-sm leading-7 text-background/70">
                    Groxy combines a premium bookstore front end, a clean merchant studio,
                    and structured marketplace controls for growth-ready commerce.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-background/72">
                  <p className="font-medium text-background">Explore</p>
                  <InteractiveLink href={APP_ROUTES.books} className="block hover:text-background" pendingClassName="opacity-80">
                    Catalog
                  </InteractiveLink>
                  <InteractiveLink href={APP_ROUTES.about} className="block hover:text-background" pendingClassName="opacity-80">
                    About
                  </InteractiveLink>
                  <InteractiveLink href={APP_ROUTES.contact} className="block hover:text-background" pendingClassName="opacity-80">
                    Contact
                  </InteractiveLink>
                </div>
                <div className="space-y-3 text-sm text-background/72">
                  <p className="font-medium text-background">{user ? "Workspace" : "Access"}</p>
                  {footerAccessLinks.map((item) => (
                    <InteractiveLink
                      key={item.href}
                      href={item.href}
                      className="block hover:text-background"
                      pendingClassName="opacity-80"
                    >
                      {item.label}
                    </InteractiveLink>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/10">
                <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-background/60 sm:px-6 lg:px-8">
                  <p>© {new Date().getFullYear()} Rusoxy. All rights reserved.</p>
                  <p>Built for elegant book commerce.</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
