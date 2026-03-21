import Link from "next/link";

import { cn } from "@/lib/utils";

export function GroxyLogo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="relative inline-flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#2b5beb,#1a2b66)] shadow-[0_18px_40px_-20px_rgba(43,91,235,0.75)]">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_60%)]" />
        <span className="relative font-heading text-lg font-semibold text-white">G</span>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading text-xl tracking-tight",
            light ? "text-white" : "text-foreground"
          )}
        >
          Groxy
        </span>
        <span className={cn("text-xs uppercase tracking-[0.22em]", light ? "text-white/60" : "text-muted-foreground")}>
          Books
        </span>
      </span>
    </Link>
  );
}
