import Link from "next/link";

import { EmptyPanel } from "@/features/dashboard/empty-panel";
import { getBookHref } from "@/lib/catalog";
import { getMerchantDashboardData } from "@/lib/dashboard-data";

export default async function MerchantBooksPage() {
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

  return (
    <div className="space-y-4">
      {books.map((book) => (
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
            <Link href={getBookHref(book)} className="text-primary hover:underline">
              View
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
