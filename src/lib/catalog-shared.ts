import { buildBookSlug, slugify } from "@/lib/slug";
import type { CatalogBook } from "@/types/platform";

export function getBookHref(book: Pick<CatalogBook, "id" | "title">) {
  return `/books/${buildBookSlug(book.title, book.id)}`;
}

export function groupCatalogBooks(books: CatalogBook[]) {
  const categoryMap = new Map<string, number>();
  const authorMap = new Map<string, number>();

  for (const book of books) {
    categoryMap.set(book.genre, (categoryMap.get(book.genre) ?? 0) + 1);
    authorMap.set(book.author, (authorMap.get(book.author) ?? 0) + 1);
  }

  const categories = [...categoryMap.entries()]
    .map(([name, count]) => ({ name, count, slug: slugify(name) }))
    .sort((a, b) => b.count - a.count);

  const authors = [...authorMap.entries()]
    .map(([name, count]) => ({ name, count, slug: slugify(name) }))
    .sort((a, b) => b.count - a.count);

  return { categories, authors };
}

export function filterBooksByCategory(books: CatalogBook[], slug: string) {
  return books.filter((book) => slugify(book.genre) === slug);
}

export function filterBooksByAuthor(books: CatalogBook[], slug: string) {
  return books.filter((book) => slugify(book.author) === slug);
}

