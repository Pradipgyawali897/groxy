import Link from "next/link";
import type { Metadata } from "next";

import { GroxyLogo } from "@/components/groxy-logo";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import "./globals.css";

export const metadata: Metadata = {
  title: "Groxy",
  description: "Blue minimal book marketplace for customers and merchants.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="theme min-h-full bg-background text-foreground">
        <ThemeProvider>
          <div className="flex min-h-full flex-col">
            <div className="border-b border-border/60 bg-background/80 backdrop-blur">
              <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 md:px-10">
                <GroxyLogo />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Link href="/service/select" className="hover:text-foreground">
                    Services
                  </Link>
                  <Link href="/customer" className="hover:text-foreground">
                    Customer
                  </Link>
                  <Link href="/merchant" className="hover:text-foreground">
                    Merchant
                  </Link>
                  <ModeToggle />
                  <span>{user?.email ?? "Guest"}</span>
                </div>
              </div>
            </div>
            <div className="flex-1">{children}</div>
            <footer className="border-t border-border/60 bg-background/80">
              <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-muted-foreground md:px-10">
                <p>© {new Date().getFullYear()} rusoxy. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <Link href="/" className="hover:text-foreground">
                    Home
                  </Link>
                  <Link href="/customer" className="hover:text-foreground">
                    Customer
                  </Link>
                  <Link href="/merchant" className="hover:text-foreground">
                    Merchant
                  </Link>
                  <Link href="/admin" className="hover:text-foreground">
                    Admin
                  </Link>
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
