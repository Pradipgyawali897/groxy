import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogBook } from "@/types/platform";

export async function getMerchantBookById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return (data as CatalogBook | null) ?? null;
}

