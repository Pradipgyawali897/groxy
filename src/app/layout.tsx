import type { Metadata } from "next";
import { GroxyLogo } from "@/components/groxy-logo";
import { InteractiveLink } from "@/components/interactive-link";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath } from "@/lib/roles";

import "@/design-system/core/index.css";

export const metadata: Metadata = {
  title: {
    default: "Groxy Books",
    template: "%s | Groxy Books",
  },
  description: "A premium, curated bookstore experience.",
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

  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <div className="flex min-h-full flex-col">
            <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur">
              <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                  <GroxyLogo />
                  <nav className="hidden md:flex gap-6 text-sm">
                    <InteractiveLink href={APP_ROUTES.books} className="hover:text-foreground/70">Books</InteractiveLink>
                    <InteractiveLink href={APP_ROUTES.about} className="hover:text-foreground/70">About</InteractiveLink>
                  </nav>
                </div>
                
                <div className="flex items-center gap-4">
                  <ModeToggle />
                  <InteractiveLink
                    href={dashboardHref}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-xs font-medium text-background transition hover:bg-foreground/90"
                  >
                    {user ? "Workspace" : "Sign In"}
                  </InteractiveLink>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border mt-24">
              <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Groxy Books. All rights reserved.</p>
              </div>
            </footer>
          </div>
          <Toaster closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
