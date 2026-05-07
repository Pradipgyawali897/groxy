import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseBookIdFromSlug } from "@/lib/slug";
import type { CatalogBook } from "@/types/platform";

export {
  filterBooksByAuthor,
  filterBooksByCategory,
  getBookHref,
  groupCatalogBooks,
} from "@/lib/catalog-shared";

export async function listPublishedBooks(limit?: number) {
  const supabase = await createSupabaseServerClient();
  try {
    let query = supabase
      .from("books")
      .select("*")
      .eq("status", "published")
      .eq("inventory_state", "AVAILABLE")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as CatalogBook[];
  } catch {
    return [];
  }
}

export async function getPublishedBookBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const id = parseBookIdFromSlug(slug);
  try {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .eq("inventory_state", "AVAILABLE")
      .maybeSingle();

    if (error) return null;
    return (data as CatalogBook | null) ?? null;
  } catch {
    return null;
  }
}
