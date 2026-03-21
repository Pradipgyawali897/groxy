import Link from "next/link";
import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import "./globals.css";

export const metadata: Metadata = {
  title: "Shop Starter",
  description: "Next.js and shadcn/ui starter setup.",
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
                <Link href="/" className="text-sm font-semibold tracking-wide">
                  SHOP
                </Link>
                <div className="text-sm text-muted-foreground">
                  {user?.email ?? "Guest"}
                </div>
              </div>
            </div>
            {children}
          </div>
          <Toaster closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
