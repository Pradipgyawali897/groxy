"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/roles";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="theme min-h-full bg-background text-foreground">
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-6 py-14 text-center">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/75">
              System error
            </p>
            <h1 className="font-heading text-5xl tracking-tight">App failed to render</h1>
            <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground">
              {error?.message ? error.message : "A fatal error occurred. Retry or return home."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className={buttonVariants({ variant: "default", size: "lg", className: "h-11 rounded-2xl px-5" })}
            >
              Retry
            </button>
            <Link
              href={APP_ROUTES.landing}
              className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 rounded-2xl px-5" })}
            >
              Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
