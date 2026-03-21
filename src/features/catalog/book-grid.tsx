import type { CatalogBook } from "@/types/platform";

import { BookCard } from "./book-card";

export function BookGrid({
  books,
  compact = false,
}: {
  books: CatalogBook[];
  compact?: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} compact={compact} />
      ))}
    </div>
  );
}
