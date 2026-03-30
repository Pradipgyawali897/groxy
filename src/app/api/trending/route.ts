import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listPublishedBooks } from "@/lib/catalog";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

function reorderByIds<T extends { id: string }>(items: T[], ids: string[]) {
  const map = new Map(items.map((item) => [item.id, item]));
  const out: T[] = [];
  for (const id of ids) {
    const item = map.get(id);
    if (item) out.push(item);
  }
  return out;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const limit = parsed.data.limit;
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("mv_book_popularity_14d")
      .select("book_id,pop_score")
      .order("pop_score", { ascending: false })
      .limit(limit);
    if (error) throw error;

    const ids = (data ?? []).map((row: any) => row.book_id as string);
    if (!ids.length) {
      const fallback = await listPublishedBooks(limit);
      return NextResponse.json(
        { books: fallback },
        { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } }
      );
    }

    const { data: books } = await supabase
      .from("books")
      .select("*")
      .in("id", ids)
      .eq("status", "published");

    const ordered = reorderByIds((books as any[]) ?? [], ids);
    return NextResponse.json(
      { books: ordered.slice(0, limit) },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch {
    const fallback = await listPublishedBooks(limit);
    return NextResponse.json(
      { books: fallback },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } }
    );
  }
}

