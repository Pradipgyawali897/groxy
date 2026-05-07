import { BookFeed } from "@/features/catalog/book-feed";
import { SectionHeading } from "@/features/shared/section-heading";
import { listPublishedBooks } from "@/lib/catalog";

export default async function CustomerBooksPage() {
  const books = await listPublishedBooks(48);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Catalog"
        title="All available books"
        description="Compare price, condition, seller, and availability before adding a copy to your cart."
      />
      <BookFeed books={books} compact batchSize={8} label="Available copies" />
    </div>
  );
}
