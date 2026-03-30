import Image from "next/image";

import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-muted/90", className)} />;
}

function FloatingLogoMark({ darkSurface = false }: { darkSurface?: boolean }) {
  return (
    <div className="relative inline-flex items-center gap-4">
      <div
        className={cn(
          "relative h-20 w-20 overflow-hidden rounded-full ring-1 shadow-[0_26px_80px_-40px_rgba(15,23,42,0.55)] animate-float",
          darkSurface ? "bg-white/10 ring-white/15" : "bg-background/90 ring-border/60"
        )}
      >
        <Image
          src={darkSurface ? "/logol.png" : "/logod.png"}
          alt="Groxy logo"
          fill
          className="object-cover dark:hidden"
          priority
        />
        <Image
          src={darkSurface ? "/logod.png" : "/logol.png"}
          alt="Groxy logo"
          fill
          className="hidden object-cover dark:block"
          priority
        />
      </div>
      <div
        className={cn(
          "absolute inset-[-12px] rounded-full border-2 animate-spin",
          darkSurface ? "border-white/25 border-t-transparent" : "border-primary/45 border-t-transparent"
        )}
      />
    </div>
  );
}

export function LandingPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-7">
          <FloatingLogoMark />
          <SkeletonBlock className="h-9 w-44 rounded-full" />
          <div className="space-y-4">
            <SkeletonBlock className="h-16 w-full max-w-3xl" />
            <SkeletonBlock className="h-16 w-11/12 max-w-2xl" />
            <SkeletonBlock className="h-6 w-4/5 max-w-2xl" />
            <SkeletonBlock className="h-6 w-3/5 max-w-xl" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SkeletonBlock className="h-12 w-52" />
            <SkeletonBlock className="h-12 w-44" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-40 w-full rounded-[1.75rem]" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SkeletonBlock className="h-[430px] w-full rounded-[2rem]" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-36 w-full rounded-[1.5rem]" />
            ))}
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <SkeletonBlock className="h-6 w-36" />
        <SkeletonBlock className="h-12 w-full max-w-2xl" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-[420px] w-full rounded-[1.75rem]" />
          ))}
        </div>
      </section>
    </main>
  );
}

export function CatalogListSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-6 rounded-[2rem] border border-border/70 bg-card/85 p-8 shadow-sm lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-12 w-full max-w-xl" />
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-12 w-full max-w-xl" />
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
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-full" />
            ))}
          </div>
        </aside>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-[420px] w-full rounded-[1.75rem]" />
          ))}
        </div>
      </section>
    </main>
  );
}

export function BookDetailSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-4 w-36" />
      </div>
      <section className="grid gap-8 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
        <SkeletonBlock className="h-[520px] w-full rounded-[1.75rem]" />
        <div className="space-y-6">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-14 w-4/5" />
            <SkeletonBlock className="h-6 w-1/2" />
          </div>
          <SkeletonBlock className="h-8 w-40" />
          <SkeletonBlock className="h-28 w-full" />
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24 w-full" />
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SkeletonBlock className="h-12 flex-1" />
            <SkeletonBlock className="h-12 w-36" />
            <SkeletonBlock className="h-12 w-44" />
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <SkeletonBlock className="h-10 w-72" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-[420px] w-full rounded-[1.75rem]" />
          ))}
        </div>
      </section>
    </main>
  );
}

export function InformationalPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-14 w-full max-w-3xl" />
        <SkeletonBlock className="h-6 w-full max-w-2xl" />
      </div>
      <section className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-44 w-full rounded-[1.75rem]" />
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SkeletonBlock className="h-72 w-full rounded-[1.75rem]" />
        <SkeletonBlock className="h-72 w-full rounded-[1.75rem]" />
      </section>
    </main>
  );
}

export function DashboardOverviewSkeleton({ surface = "Workspace" }: { surface?: string }) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] border border-border/70 bg-card/85 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.4)]">
          <div className="space-y-5">
            <FloatingLogoMark />
            <SkeletonBlock className="h-28 w-full" />
            <div className="grid gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-11 w-full" />
              ))}
            </div>
            <SkeletonBlock className="h-24 w-full" />
          </div>
        </aside>
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">{surface}</p>
            <SkeletonBlock className="mt-3 h-12 w-80" />
            <SkeletonBlock className="mt-3 h-6 w-full max-w-2xl" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24 w-full" />
            ))}
          </div>
          <SkeletonBlock className="h-[380px] w-full rounded-[1.75rem]" />
        </div>
      </div>
    </main>
  );
}

export function DashboardCollectionSkeleton({ surface = "Library" }: { surface?: string }) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 lg:px-6">
      <div className="space-y-4 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-primary/75">{surface}</p>
        <SkeletonBlock className="h-12 w-72" />
        <SkeletonBlock className="h-6 w-full max-w-2xl" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-[420px] w-full rounded-[1.75rem]" />
        ))}
      </div>
    </main>
  );
}

export function DashboardEditorSkeleton({ surface = "Editor" }: { surface?: string }) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 lg:px-6">
      <div className="space-y-4 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-primary/75">{surface}</p>
        <SkeletonBlock className="h-12 w-80" />
        <SkeletonBlock className="h-6 w-full max-w-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/85 p-6 shadow-sm">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-12 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          <SkeletonBlock className="h-48 w-full rounded-[1.75rem]" />
          <SkeletonBlock className="h-40 w-full rounded-[1.75rem]" />
        </div>
      </div>
    </main>
  );
}

export function AdminCollectionSkeleton({ surface = "Operations" }: { surface?: string }) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 lg:px-6">
      <div className="space-y-4 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-primary/75">{surface}</p>
        <SkeletonBlock className="h-12 w-80" />
        <SkeletonBlock className="h-6 w-full max-w-3xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-24 w-full" />
        ))}
      </div>
      <SkeletonBlock className="h-[520px] w-full rounded-[1.75rem]" />
    </main>
  );
}

export function AuthPageSkeleton() {
  return (
    <main className="relative flex min-h-[calc(100vh-6rem)] items-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.45)] lg:grid-cols-[0.88fr_1.12fr]">
        <section className="space-y-6 bg-foreground px-8 py-10 text-background">
          <div className="flex items-center justify-between gap-4">
            <FloatingLogoMark darkSurface />
            <SkeletonBlock className="h-7 w-28 rounded-full bg-white/10" />
          </div>
          <SkeletonBlock className="h-5 w-28 bg-white/10" />
          <SkeletonBlock className="h-14 w-4/5 bg-white/10" />
          <SkeletonBlock className="h-20 w-full bg-white/10" />
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16 w-full bg-white/10" />
            ))}
          </div>
        </section>
        <section className="space-y-4 px-6 py-8 sm:px-8 lg:px-10">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-12 w-2/3" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-10 w-full rounded-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </section>
      </div>
    </main>
  );
}

export function OnboardingPageSkeleton() {
  return (
    <main className="relative flex min-h-[calc(100vh-6rem)] items-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.45)] lg:grid-cols-[0.82fr_1.18fr]">
        <section className="space-y-6 bg-foreground px-8 py-10 text-background">
          <div className="flex items-center justify-between gap-4">
            <FloatingLogoMark darkSurface />
            <SkeletonBlock className="h-8 w-24 rounded-full bg-white/10" />
          </div>
          <SkeletonBlock className="h-5 w-32 bg-white/10" />
          <SkeletonBlock className="h-14 w-4/5 bg-white/10" />
          <SkeletonBlock className="h-20 w-full bg-white/10" />
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-14 w-full bg-white/10" />
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
      </div>
    </main>
  );
}

export function AccountPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8 md:px-10 lg:py-10">
      <div className="flex items-center justify-between">
        <FloatingLogoMark />
        <div className="flex gap-2">
          <SkeletonBlock className="h-10 w-24" />
          <SkeletonBlock className="h-10 w-28" />
        </div>
      </div>
      <SkeletonBlock className="h-48 w-full rounded-[2rem]" />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <SkeletonBlock className="h-72 w-full rounded-[1.75rem]" />
        <SkeletonBlock className="h-72 w-full rounded-[1.75rem]" />
      </div>
    </main>
  );
}
