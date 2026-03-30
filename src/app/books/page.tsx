import { Search } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { BookGrid } from "@/features/catalog/book-grid";
import { SectionHeading } from "@/features/shared/section-heading";
import { filterBooksByAuthor, filterBooksByCategory, groupCatalogBooks, listPublishedBooks } from "@/lib/catalog";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; author?: string }>;
}) {
  const params = await searchParams;
  const books = await listPublishedBooks(24);
  const { categories, authors } = groupCatalogBooks(books);

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
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-6 rounded-[2rem] border border-border/70 bg-card/85 p-8 shadow-sm lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Catalog"
            title="Browse a modern bookstore catalog"
            description="Search titles, follow categories, and move through a clean, premium browsing experience designed for books first."
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
        <div className="grid gap-4 text-sm">
          <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
            <p className="text-muted-foreground">Books available</p>
            <p className="mt-3 font-heading text-4xl tracking-tight">{filtered.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
            <p className="text-muted-foreground">Categories</p>
            <p className="mt-3 font-heading text-4xl tracking-tight">{categories.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Popular categories</p>
            <div className="mt-4 grid gap-2">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  href={`/books?category=${category.slug}`}
                  className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {category.name} ({category.count})
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Trending authors</p>
            <div className="mt-4 grid gap-2">
              {authors.slice(0, 8).map((author) => (
                <Link
                  key={author.slug}
                  href={`/books?author=${author.slug}`}
                  className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {author.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
        <div className="space-y-6">
          {filtered.length > 0 ? (
            <BookGrid books={filtered} compact />
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-border bg-card/70 p-8 text-center">
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
