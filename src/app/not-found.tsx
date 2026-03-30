import Link from "next/link";

import { GroxyLogo } from "@/components/groxy-logo";
import { buttonVariants } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/roles";

export default function NotFound() {
  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-6 py-14 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.12),transparent_40%),radial-gradient(circle_at_0%_80%,rgba(212,167,98,0.12),transparent_45%)]" />
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
          className={buttonVariants({ variant: "default", size: "lg", className: "h-11 rounded-2xl px-5" })}
        >
          Browse books
        </Link>
        <Link
          href={APP_ROUTES.landing}
          className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 rounded-2xl px-5" })}
        >
          Home
        </Link>
      </div>
    </main>
  );
}
