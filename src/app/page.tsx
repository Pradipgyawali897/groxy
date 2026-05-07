import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { BookGrid } from "@/features/catalog/book-grid";
import { TrendingShelf } from "@/features/reco/trending-shelf";
import { listPublishedBooks } from "@/lib/catalog";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath } from "@/lib/roles";

export default async function HomePage() {
  const [{ role, isOnboarded, canAccessAdmin }, books] = await Promise.all([
    getViewerContext(),
    listPublishedBooks(8),
  ]);

  const featuredBooks = books.slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Editorial Hero */}
      <section className="mb-24 space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
          <Sparkles className="size-3" />
          Secondhand Bookstore
        </div>
        <h1 className="max-w-4xl font-heading text-6xl tracking-tight text-foreground sm:text-7xl">
          Beautifully curated books, a calmer marketplace.
        </h1>
        <div className="flex gap-4">
          <Link
            href={role || isOnboarded ? getAuthedPath({ role, isOnboarded, canAccessAdmin }) : APP_ROUTES.signUp}
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background"
          >
            {isOnboarded ? "Enter workspace" : "Get started"}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </section>

      {/* Featured Catalog */}
      <section className="mb-24">
        <div className="mb-12 flex items-baseline justify-between border-b border-border pb-6">
          <h2 className="font-heading text-3xl">Featured titles</h2>
          <Link href={APP_ROUTES.books} className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <BookGrid books={featuredBooks} />
      </section>

      {/* Editorial Shelves */}
      <section className="space-y-24">
        <TrendingShelf />
      </section>
    </main>
  );
}
