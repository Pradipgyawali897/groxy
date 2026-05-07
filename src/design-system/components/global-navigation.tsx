import { tokens } from "@/design-system/core/tokens";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const GlobalNavigation = () => (
  <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
    <div className={cn(tokens.spacing.container, "flex h-16 items-center justify-between")}>
      <Link href="/" className={cn(tokens.typography.heading, "text-xl")}>
        Groxy
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/books" className={tokens.typography.ui}>Catalog</Link>
        <Link href="/sign-in" className={cn(tokens.typography.ui, "rounded-full bg-zinc-900 px-5 py-2 text-white")}>
          Sign in
        </Link>
      </nav>
    </div>
  </header>
);
