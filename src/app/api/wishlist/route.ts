import { NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const addSchema = z.object({ book_id: z.string().uuid() });
const removeSchema = z.object({ book_id: z.string().uuid() });

async function ensureWishlistId(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) {
  const { data: existing, error: existingErr } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingErr) throw existingErr;
  if (existing?.id) return existing.id as string;

  const { data: created, error: createErr } = await supabase
    .from("wishlists")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (createErr) throw createErr;
  return created.id as string;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wishlist?.id) {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id,created_at,book_id,books(*)")
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: (data ?? []).map((row: any) => ({
      id: row.id,
      created_at: row.created_at,
      book: row.books,
      book_id: row.book_id,
    })),
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`wishlist:add:${ip}`, { windowMs: 60 * 1000, max: 60 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many wishlist requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  try {
    const wishlistId = await ensureWishlistId(supabase, user.id);
    const { error } = await supabase.from("wishlist_items").insert({
      wishlist_id: wishlistId,
      book_id: parsed.data.book_id,
    });

    // ignore "duplicate" inserts from double-clicks
    if (error && !String(error.message).toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also log an implicit feedback event if `book_events` exists.
    await supabase.from("book_events").insert({
      user_id: user.id,
      book_id: parsed.data.book_id,
      event_type: "wishlist_add",
      event_weight: 2,
      context: { source: "wishlist_api" },
    });

    // Best-effort cache refresh (requires `refresh_my_reco_cache` to exist).
    const refresh = await supabase.rpc("refresh_my_reco_cache", { p_limit: 24, p_ttl_seconds: 600 });
    if (refresh.error) {
      const msg = String(refresh.error.message ?? "").toLowerCase();
      // If the SQL hasn’t been deployed yet, don’t fail the wishlist flow.
      if (!(msg.includes("function") && msg.includes("refresh_my_reco_cache"))) {
        // ignore other refresh errors too; wishlist write succeeded.
      }
    }
  } catch (err: any) {
    const msg = err?.message ? String(err.message) : "Failed to update wishlist.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`wishlist:remove:${ip}`, { windowMs: 60 * 1000, max: 60 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many wishlist requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  try {
    const { data: wishlist } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (wishlist?.id) {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("wishlist_id", wishlist.id)
        .eq("book_id", parsed.data.book_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("book_events").insert({
      user_id: user.id,
      book_id: parsed.data.book_id,
      event_type: "wishlist_remove",
      event_weight: 1,
      context: { source: "wishlist_api" },
    });

    const refresh = await supabase.rpc("refresh_my_reco_cache", { p_limit: 24, p_ttl_seconds: 600 });
    if (refresh.error) {
      const msg = String(refresh.error.message ?? "").toLowerCase();
      if (!(msg.includes("function") && msg.includes("refresh_my_reco_cache"))) {
        // ignore
      }
    }
  } catch (err: any) {
    const msg = err?.message ? String(err.message) : "Failed to update wishlist.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
