"use client";

import { usePathname } from "next/navigation";

import { InteractiveLink } from "@/components/interactive-link";
import { isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV } from "@/lib/roles";

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-2 text-sm lg:flex">
      {PUBLIC_NAV.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <InteractiveLink
            key={item.href}
            href={item.href}
            pendingClassName="scale-[0.98]"
            className={cn(
              "rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground",
              active && "bg-foreground text-background shadow-sm hover:bg-foreground hover:text-background"
            )}
          >
            {item.label}
          </InteractiveLink>
        );
      })}
    </nav>
  );
}
