import Link from "next/link";
import { notFound } from "next/navigation";

import { BookGrid } from "@/features/catalog/book-grid";
import { SectionHeading } from "@/features/shared/section-heading";
import { filterBooksByCategory, groupCatalogBooks, listPublishedBooks } from "@/lib/catalog";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const books = await listPublishedBooks(24);
  const { categories } = groupCatalogBooks(books);
  const currentCategory = categories.find((category) => category.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  const filtered = filterBooksByCategory(books, slug);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">
        Back to catalog
      </Link>
      <SectionHeading
        eyebrow="Category"
        title={currentCategory.name}
        description={`${currentCategory.count} books in this shelf.`}
      />
      <BookGrid books={filtered} compact />
    </main>
  );
}
