import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildBookSlug, parseBookIdFromSlug, slugify } from "@/lib/slug";
import type { CatalogBook } from "@/types/platform";

export async function listPublishedBooks(limit?: number) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("books")
    .select("*")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as CatalogBook[];
}

export async function getPublishedBookBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const id = parseBookIdFromSlug(slug);
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) return null;
  return (data as CatalogBook | null) ?? null;
}

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
