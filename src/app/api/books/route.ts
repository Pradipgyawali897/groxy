import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const genre = url.searchParams.get("genre")?.trim();
  const condition = url.searchParams.get("condition")?.trim();
  const minPrice = Number(url.searchParams.get("minPrice") ?? "0");
  const maxPrice = Number(url.searchParams.get("maxPrice") ?? "1000000");
  const sort = url.searchParams.get("sort") ?? "latest";

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("books")
    .select("*")
    .eq("status", "published")
    .gte("price", Number.isFinite(minPrice) ? minPrice : 0)
    .lte("price", Number.isFinite(maxPrice) ? maxPrice : 1000000);

  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,genre.ilike.%${search}%`);
  }
  if (genre) {
    query = query.eq("genre", genre);
  }
  if (condition) {
    query = query.eq("book_condition", condition);
  }

  if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ books: data ?? [] });
}
