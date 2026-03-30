import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogBook } from "@/types/platform";

function reorderByIds<T extends { id: string }>(items: T[], ids: string[]) {
  const map = new Map(items.map((item) => [item.id, item]));
  const out: T[] = [];
  for (const id of ids) {
    const item = map.get(id);
    if (item) out.push(item);
  }
  return out;
}

export async function getFrequentlyBoughtTogether(bookId: string, limit = 4) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase.rpc("get_fbt", {
      p_book_id: bookId,
      p_limit: limit,
    });
    if (error) throw error;

    const ids = ((data as any[]) ?? []).map((row) => row.book_id as string);
    if (!ids.length) return [] as CatalogBook[];

    const { data: books } = await supabase
      .from("books")
      .select("*")
      .in("id", ids)
      .eq("status", "published");

    return reorderByIds((books as CatalogBook[] | null) ?? [], ids).slice(0, limit);
  } catch {
    return [] as CatalogBook[];
  }
}

