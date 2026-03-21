import Link from "next/link";

import { AuthSessionProvider } from "@/components/auth-session-provider";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { authOptions } from "@/lib/auth";

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
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="theme min-h-full bg-background text-foreground">
        <AuthSessionProvider>
          <ThemeProvider>
            <div className="flex min-h-full flex-col">
              <div className="border-b border-border/60 bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 md:px-10">
                  <Link href="/" className="text-sm font-semibold tracking-wide">
                    SHOP
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {session?.user ? session.user.email : "Guest"}
                  </div>
                </div>
              </div>
              {children}
            </div>
            <Toaster closeButton richColors />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
