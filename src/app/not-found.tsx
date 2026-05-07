import Link from "next/link";

import { GroxyLogo } from "@/components/groxy-logo";
import { APP_ROUTES } from "@/lib/roles";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-6 py-14 text-center">
      <div className="animate-fade-in">
        <GroxyLogo />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/75">
          404
        </p>
        <h1 className="font-heading text-5xl tracking-tight">Page not found</h1>
        <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground">
          The page you’re trying to open doesn’t exist. Use the navigation above or jump back into the catalog.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={APP_ROUTES.books}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95"
        >
          Browse books
        </Link>
        <Link
          href={APP_ROUTES.landing}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
