"use client";

import { usePathname } from "next/navigation";

import { InteractiveLink } from "@/components/interactive-link";
import { isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV } from "@/lib/roles";

export function PublicNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("hidden items-center gap-6 text-sm font-medium md:flex", className)}>
      {PUBLIC_NAV.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <InteractiveLink
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              active ? "text-foreground" : "text-foreground/60"
            )}
          >
            {item.label}
          </InteractiveLink>
        );
      })}
    </nav>
  );
}
