import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyPanel } from "@/features/dashboard/empty-panel";
import { SectionHeading } from "@/features/shared/section-heading";
import { BOOK_STATUSES } from "@/lib/books";
import { getBookHref } from "@/lib/catalog";
import { getMerchantDashboardData } from "@/lib/dashboard-data";

export default async function MerchantBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { books } = await getMerchantDashboardData();

  if (!books.length) {
    return (
      <EmptyPanel
        title="No books in your store yet"
        description="Create your first listing to start building a merchant catalog."
        actionLabel="Add a book"
        actionHref="/merchant/books/new"
      />
    );
  }

  let filtered = books;
  const q = params.q?.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.genre.toLowerCase().includes(q)
    );
  }
  if (params.status?.trim()) {
    filtered = filtered.filter((book) => book.status === params.status);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Inventory"
            title="Your book listings"
            description="Manage drafts, published titles, stock levels, and featured placement from one place."
          />
          <Link
            href="/merchant/books/new"
            className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm text-primary-foreground"
          >
            Add book
          </Link>
        </div>
      </section>

      <form className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm sm:grid-cols-[1fr_220px_140px]">
        <Input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search title, author, genre"
          className="h-12 rounded-2xl px-4"
        />
        <Select name="status" defaultValue={params.status ?? ""}>
          <option value="">All statuses</option>
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <button className="h-12 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground">
          Filter
        </button>
      </form>

      {filtered.map((book) => (
        <article
          key={book.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm"
        >
          <div>
            <p className="font-heading text-2xl tracking-tight">{book.title}</p>
            <p className="text-sm text-muted-foreground">
              {book.author} • {book.status}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Stock {book.stock}</span>
            <span className="font-medium">${Number(book.price).toFixed(2)}</span>
            <Link href={`/merchant/books/${book.id}`} className="text-foreground hover:underline">
              Edit
            </Link>
            {book.status === "published" ? (
              <Link href={getBookHref(book)} className="text-primary hover:underline">
                View
              </Link>
            ) : (
              <span className="text-muted-foreground">Not published</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
