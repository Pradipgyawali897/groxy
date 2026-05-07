"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth-controls";
import { GroxyLogo } from "@/components/groxy-logo";
import { isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type ShellTone = "reader" | "seller" | "admin";

export function DashboardShell({
  title,
  description,
  badge,
  tone = "reader",
  nav,
  userEmail,
  children,
}: {
  title: string;
  description: string;
  badge: string;
  tone?: ShellTone;
  nav: readonly { label: string; href: string }[];
  userEmail?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shell = {
    reader: {
      frame: "lg:grid-cols-[240px_1fr]",
      aside: "border-border/60 bg-background",
      panel: "bg-card",
      active: "bg-foreground text-background",
      inactive: "text-muted-foreground hover:bg-muted hover:text-foreground",
    },
    seller: {
      frame: "lg:grid-cols-[260px_1fr]",
      aside: "border-border bg-card",
      panel: "bg-background",
      active: "bg-primary text-primary-foreground",
      inactive: "text-muted-foreground hover:bg-background hover:text-foreground",
    },
    admin: {
      frame: "lg:grid-cols-[248px_1fr]",
      aside: "border-border bg-foreground text-background",
      panel: "bg-background/10",
      active: "bg-background text-foreground",
      inactive: "text-background/65 hover:bg-background/10 hover:text-background",
    },
  }[tone];

  return (
    <div className={cn("mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:px-6", shell.frame)}>
      <aside className={cn("rounded-lg border p-4 shadow-sm lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]", shell.aside)}>
        <div className="flex h-full flex-col">
          <div className="space-y-3">
            <GroxyLogo />
            <div className={cn("rounded-lg p-4", shell.panel)}>
              <p className={cn("text-xs font-medium uppercase tracking-[0.18em]", tone === "admin" ? "text-background/65" : "text-primary/75")}>
                {badge}
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
              <p className={cn("mt-2 text-sm leading-6", tone === "admin" ? "text-background/65" : "text-muted-foreground")}>
                {description}
              </p>
            </div>
          </div>

          <nav className="mt-5 grid gap-1.5">
            {nav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition",
                    active ? shell.active : shell.inactive
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <div className={cn("rounded-lg border p-3 text-sm", tone === "admin" ? "border-background/15 bg-background/10" : "border-border/70 bg-background")}>
              <p className={tone === "admin" ? "text-background/60" : "text-muted-foreground"}>Signed in</p>
              <p className={cn("mt-1 truncate font-medium", tone === "admin" ? "text-background" : "text-foreground")}>
                {userEmail ?? "Guest"}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
