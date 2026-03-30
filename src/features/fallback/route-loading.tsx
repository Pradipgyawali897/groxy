"use client";

import { usePathname } from "next/navigation";

import SpinnerLoading from "@/components/skeleton_loader/spinner";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

function CatalogSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-6 rounded-[2rem] border border-border/70 bg-card/85 p-8 shadow-sm lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-12 w-full max-w-xl" />
          <SkeletonBlock className="h-4 w-3/4" />
        </div>
        <div className="grid gap-4 text-sm">
          <SkeletonBlock className="h-28 w-full" />
          <SkeletonBlock className="h-28 w-full" />
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-sm">
          <SkeletonBlock className="h-4 w-40" />
          <div className="grid gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10 w-full" />
            ))}
          </div>
        </aside>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[420px] w-full rounded-[1.75rem]" />
          ))}
        </div>
      </section>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <SkeletonBlock className="h-10 w-72" />
      <SkeletonBlock className="h-40 w-full rounded-[2rem]" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24 w-full" />
        ))}
      </div>
      <SkeletonBlock className="h-[420px] w-full" />
    </main>
  );
}

function AuthSkeleton() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-0 overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.45)] lg:grid-cols-[0.88fr_1.12fr]">
      <section className="space-y-6 bg-foreground px-8 py-10 text-background">
        <SkeletonBlock className="h-16 w-16 rounded-full bg-white/10" />
        <SkeletonBlock className="h-5 w-28 bg-white/10" />
        <SkeletonBlock className="h-14 w-4/5 bg-white/10" />
        <SkeletonBlock className="h-20 w-full bg-white/10" />
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16 w-full bg-white/10" />
          ))}
        </div>
      </section>
      <section className="space-y-4 px-6 py-8 sm:px-8 lg:px-10">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-12 w-2/3" />
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-12 w-full" />
      </section>
    </main>
  );
}

function OnboardingSkeleton() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-0 overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.45)] lg:grid-cols-[0.82fr_1.18fr]">
      <section className="space-y-6 bg-foreground px-8 py-10 text-background">
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-16 w-16 rounded-full bg-white/10" />
          <SkeletonBlock className="h-8 w-24 rounded-full bg-white/10" />
        </div>
        <SkeletonBlock className="h-5 w-32 bg-white/10" />
        <SkeletonBlock className="h-14 w-4/5 bg-white/10" />
        <SkeletonBlock className="h-20 w-full bg-white/10" />
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-14 w-full bg-white/10" />
          ))}
        </div>
      </section>
      <section className="space-y-4 px-6 py-8 sm:px-8 lg:px-10">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-12 w-2/3" />
        <SkeletonBlock className="h-16 w-full" />
        <SkeletonBlock className="h-2 w-full rounded-full" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-12 w-full" />
      </section>
    </main>
  );
}

export function RouteLoading() {
  const pathname = usePathname();

  // If you see the global spinner only, it usually means the root layout is suspended.
  // Prefer route-shaped skeletons to keep the UI feeling "real".
  if (pathname.startsWith("/books") || pathname.startsWith("/authors") || pathname.startsWith("/categories")) {
    return <CatalogSkeleton />;
  }

  if (pathname.startsWith("/customer") || pathname.startsWith("/merchant") || pathname.startsWith("/admin")) {
    return <DashboardSkeleton />;
  }

  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return <AuthSkeleton />;
  }

  if (pathname.startsWith("/onboarding")) {
    return <OnboardingSkeleton />;
  }

  return <SpinnerLoading />;
}
