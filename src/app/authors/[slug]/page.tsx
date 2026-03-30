import Link from "next/link";
import { notFound } from "next/navigation";

import { BookFeed } from "@/features/catalog/book-feed";
import { SectionHeading } from "@/features/shared/section-heading";
import { filterBooksByAuthor, groupCatalogBooks, listPublishedBooks } from "@/lib/catalog";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const books = await listPublishedBooks(48);
  const { authors } = groupCatalogBooks(books);
  const currentAuthor = authors.find((author) => author.slug === slug);

  if (!currentAuthor) {
    notFound();
  }

  const filtered = filterBooksByAuthor(books, slug);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">
        Back to catalog
      </Link>
      <SectionHeading
        eyebrow="Author"
        title={currentAuthor.name}
        description={`${currentAuthor.count} books currently available from this author in the catalog.`}
      />
      <BookFeed books={filtered} compact batchSize={8} label="Author shelf" />
    </main>
  );
}
