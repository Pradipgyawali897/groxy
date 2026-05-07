"use client";

import * as React from "react";
import Link from "next/link";

import { GroxyLogo } from "@/components/groxy-logo";
import { buttonVariants } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/roles";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-6 py-14 text-center">
      <div className="animate-fade-in">
        <GroxyLogo />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/75">
          Something went wrong
        </p>
        <h1 className="font-heading text-5xl tracking-tight">We couldn’t load this page</h1>
        <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground">
          {error?.message ? error.message : "A temporary error occurred. Try again."}
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
          href={APP_ROUTES.books}
          className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 rounded-2xl px-5" })}
        >
          Browse books
        </Link>
      </div>
    </main>
  );
}
