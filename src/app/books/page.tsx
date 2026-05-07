import { Search } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { BookFeed } from "@/features/catalog/book-feed";
import { SectionHeading } from "@/features/shared/section-heading";
import { filterBooksByAuthor, filterBooksByCategory, groupCatalogBooks, listPublishedBooks } from "@/lib/catalog";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; author?: string }>;
}) {
  const params = await searchParams;
  const books = await listPublishedBooks(60);
  const { categories } = groupCatalogBooks(books);

  let filtered = books;

  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
    );
  }

  if (params.category) {
    filtered = filterBooksByCategory(filtered, params.category);
  }

  if (params.author) {
    filtered = filterBooksByAuthor(filtered, params.author);
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Catalog"
            title="Browse available books"
            description="Search by title, author, genre, or description. Filter by shelf when you know what you want."
          />
          <form className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search by title, author, or description"
              className="h-12 rounded-2xl pl-11"
            />
          </form>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-muted-foreground">Books available</p>
            <p className="mt-3 font-heading text-4xl tracking-tight">{filtered.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-muted-foreground">Categories</p>
            <p className="mt-3 font-heading text-4xl tracking-tight">{categories.length}</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.slug}
              href={`/books?category=${category.slug}`}
              className="group rounded-lg border border-border bg-card p-5 shadow-sm transition hover:bg-background"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Shelf</p>
              <h2 className="mt-3 font-heading text-2xl tracking-tight">{category.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{category.count} available copies</p>
            </Link>
          ))}
        </div>
        <div className="space-y-6">
          {filtered.length > 0 ? (
            <BookFeed books={filtered} compact batchSize={8} label="Catalog stream" />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
              <h2 className="font-heading text-3xl tracking-tight">No books matched this search</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Try a different keyword, clear the category filter, or return to the main catalog.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
