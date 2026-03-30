import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

function getSidFromCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)groxy_sid=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const limit = parsed.data.limit;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sid = getSidFromCookie(request.headers.get("cookie"));

  // If `book_events` isn’t deployed yet, return empty.
  try {
    if (user) {
      const { data, error } = await supabase
        .from("book_events")
        .select("book_id,created_at,books(*)")
        .eq("user_id", user.id)
        .eq("event_type", "view")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const raw = (data ?? []).map((row: any) => row.books).filter(Boolean);
      const seen = new Set<string>();
      const books = raw.filter((book: any) => {
        if (!book?.id) return false;
        if (seen.has(book.id)) return false;
        seen.add(book.id);
        return true;
      });
      return NextResponse.json({ books });
    }

    if (sid) {
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin
        .from("book_events")
        .select("book_id,created_at,books(*)")
        .eq("anon_session_id", sid)
        .eq("event_type", "view")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const raw = (data ?? []).map((row: any) => row.books).filter(Boolean);
      const seen = new Set<string>();
      const books = raw.filter((book: any) => {
        if (!book?.id) return false;
        if (seen.has(book.id)) return false;
        seen.add(book.id);
        return true;
      });
      return NextResponse.json({ books });
    }
  } catch (err: any) {
    const msg = err?.message ? String(err.message).toLowerCase() : "";
    if (msg.includes("relation") && msg.includes("book_events")) {
      return NextResponse.json({ books: [] });
    }
    return NextResponse.json({ error: "Failed to load recently viewed." }, { status: 500 });
  }

  return NextResponse.json({ books: [] });
}
