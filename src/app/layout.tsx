import Link from "next/link";
import type { Metadata } from "next";

import { GroxyLogo } from "@/components/groxy-logo";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, PUBLIC_NAV, getRoleHome } from "@/lib/roles";

import "./globals.css";

export const metadata: Metadata = {
  title: "Groxy Books",
  description: "Premium online bookstore and marketplace built for readers, merchants, and operators.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, role, isOnboarded } = await getViewerContext();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="theme min-h-full bg-background text-foreground">
        <ThemeProvider>
          <div className="flex min-h-full flex-col">
            <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
              <div className="border-b border-border/60 bg-foreground text-background">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs uppercase tracking-[0.22em] text-background/70 sm:px-6 lg:px-8">
                  <p>Rusoxy literary commerce system</p>
                  <div className="hidden items-center gap-4 sm:flex">
                    <span>Curated storefront</span>
                    <span>Seller marketplace</span>
                    <span>Structured operations</span>
                  </div>
                </div>
              </div>
              <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-left gap-8">
                  <GroxyLogo />
                  <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
                    {PUBLIC_NAV.map((item) => (
                      <Link key={item.href} href={item.href} className="hover:text-foreground">
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={APP_ROUTES.books}
                    className="hidden h-10 items-center rounded-xl border border-border px-4 text-sm text-foreground hover:bg-muted sm:inline-flex"
                  >
                    Browse books
                  </Link>
                  <Link
                    href={
                      user
                        ? isOnboarded
                          ? getRoleHome(role)
                          : APP_ROUTES.onboardingStep1
                        : APP_ROUTES.signIn
                    }
                    className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm text-primary-foreground"
                  >
                    {user ? (isOnboarded ? "Open dashboard" : "Continue onboarding") : "Sign in"}
                  </Link>
                  <ModeToggle />
                </div>
              </div>
            </header>
            <div className="flex-1">{children}</div>
            <footer className="border-t border-border/70 bg-foreground text-background">
              <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_0.8fr_0.8fr] lg:px-8">
                <div className="space-y-4">
                  <div className="flex ">
                  <GroxyLogo mybackground={"different"}/>
                  </div>
                  <p className="max-w-md text-sm leading-7 text-background/70">
                    Groxy combines a premium bookstore front end, a clean merchant studio,
                    and structured marketplace controls for growth-ready commerce.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-background/72">
                  <p className="font-medium text-background">Explore</p>
                  <Link href={APP_ROUTES.books} className="block hover:text-background">
                    Catalog
                  </Link>
                  <Link href={APP_ROUTES.about} className="block hover:text-background">
                    About
                  </Link>
                  <Link href={APP_ROUTES.contact} className="block hover:text-background">
                    Contact
                  </Link>
                </div>
                <div className="space-y-3 text-sm text-background/72">
                  <p className="font-medium text-background">Access</p>
                  <Link href={APP_ROUTES.signIn} className="block hover:text-background">
                    Sign in
                  </Link>
                  <Link href={APP_ROUTES.signUp} className="block hover:text-background">
                    Create account
                  </Link>
                  <Link href={APP_ROUTES.merchantHome} className="block hover:text-background">
                    Merchant studio
                  </Link>
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
