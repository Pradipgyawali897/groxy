"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { PUBLIC_NAV } from "@/lib/roles";

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-2 text-sm lg:flex">
      {PUBLIC_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground",
              active && "bg-foreground text-background hover:bg-foreground hover:text-background"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

