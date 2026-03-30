"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth-controls";
import { GroxyLogo } from "@/components/groxy-logo";
import { cn } from "@/lib/utils";

export function DashboardShell({
  title,
  description,
  badge,
  nav,
  userEmail,
  children,
}: {
  title: string;
  description: string;
  badge: string;
  nav: readonly { label: string; href: string }[];
  userEmail?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
      <aside className="rounded-[2rem] border border-border/70 bg-card/85 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.4)] lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
        <div className="flex h-full flex-col">
          <div className="space-y-4">
            <GroxyLogo />
            <div className="rounded-2xl bg-primary/8 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/75">
                {badge}
              </p>
              <h1 className="mt-3 font-heading text-3xl tracking-tight">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>

          <nav className="mt-6 grid gap-2">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm transition",
                    active
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm">
              <p className="text-muted-foreground">Signed in as</p>
              <p className="mt-1 truncate font-medium text-foreground">{userEmail ?? "Guest"}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
