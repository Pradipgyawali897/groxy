import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listPublishedBooks } from "@/lib/catalog";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
  surface: z.string().optional(),
});

function getSidFromCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)groxy_sid=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function buildSetSidCookie(sid: string, secure: boolean) {
  return `groxy_sid=${encodeURIComponent(sid)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;
}

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sid = getSidFromCookie(request.headers.get("cookie"));
  if (!sid) sid = crypto.randomUUID();
  const isSecure = new URL(request.url).protocol === "https:";

  // 1) Try DB cache for authed user.
  if (user) {
    try {
      const { data: cache } = await supabase
        .from("user_reco_cache")
        .select("expires_at,book_ids")
        .eq("user_id", user.id)
        .maybeSingle();

      const fresh =
        cache?.expires_at && new Date(cache.expires_at).getTime() > Date.now();
      const bookIds = (cache?.book_ids as string[] | null) ?? null;

      if (fresh && bookIds?.length) {
        const { data: books } = await supabase
          .from("books")
          .select("*")
          .in("id", bookIds.slice(0, limit))
          .eq("status", "published");
        const ordered = reorderByIds((books as any[]) ?? [], bookIds);
        return NextResponse.json(
          { books: ordered.slice(0, limit), sid, cached: true },
          { headers: { "Set-Cookie": buildSetSidCookie(sid, isSecure) } }
        );
      }
    } catch {
      // cache table missing or RLS mismatch; fall through to recompute.
    }
  }

  // 2) Compute via RPC (hybrid scoring). If not deployed, fallback to published list.
  try {
    const { data, error } = await supabase.rpc("get_recommendations", {
      p_user_id: user?.id ?? null,
      p_session_id: sid,
      p_limit: limit,
    });
    if (error) throw error;

    const ids = ((data as any[]) ?? []).map((row) => row.book_id as string);
    if (!ids.length) {
      const fallback = await listPublishedBooks(limit);
      return NextResponse.json(
        { books: fallback, sid, cached: false },
        { headers: { "Set-Cookie": buildSetSidCookie(sid, isSecure) } }
      );
    }

    const { data: books } = await supabase
      .from("books")
      .select("*")
      .in("id", ids)
      .eq("status", "published");

    const ordered = reorderByIds((books as any[]) ?? [], ids);

    // Best-effort cache write for authed user (table + RLS must exist).
    if (user) {
      try {
        await supabase.from("user_reco_cache").upsert(
          {
            user_id: user.id,
            generated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            book_ids: ids,
            scores: ((data as any[]) ?? []).map((row) => Number(row.score ?? 0)),
          },
          { onConflict: "user_id" }
        );
      } catch {
        // ignore cache failures
      }
    }

    return NextResponse.json(
      { books: ordered.slice(0, limit), sid, cached: false },
      { headers: { "Set-Cookie": buildSetSidCookie(sid, isSecure) } }
    );
  } catch {
    const fallback = await listPublishedBooks(limit);
    return NextResponse.json(
      { books: fallback, sid, cached: false },
      { headers: { "Set-Cookie": buildSetSidCookie(sid, isSecure) } }
    );
  }
}
