import { BookFeed } from "@/features/catalog/book-feed";
import { SectionHeading } from "@/features/shared/section-heading";
import { listPublishedBooks } from "@/lib/catalog";

export default async function CustomerBooksPage() {
  const books = await listPublishedBooks(48);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Customer catalog"
        title="Browse every published title"
        description="This private customer view keeps the same premium browsing language while layering future wishlist and cart behavior on top."
      />
      <BookFeed books={books} compact batchSize={8} label="Reader feed" />
    </div>
  );
}
