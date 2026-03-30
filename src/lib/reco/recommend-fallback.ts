import "server-only";

import { listPublishedBooks } from "@/lib/catalog";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogBook } from "@/types/platform";

type RecommendationFallbackInput = {
  userId?: string | null;
  sid?: string | null;
  limit?: number;
};

function addWeight(map: Map<string, number>, key: string | null | undefined, amount: number) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + amount);
}

function tokenize(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);
}

function normalizeMapScore(map: Map<string, number>, key: string) {
  if (!map.size) return 0;
  const max = Math.max(...map.values());
  if (!max) return 0;
  return (map.get(key) ?? 0) / max;
}

function priceSignal(book: CatalogBook) {
  if (!book.original_price || Number(book.original_price) <= Number(book.price)) return 0;
  return Math.min(0.4, (Number(book.original_price) - Number(book.price)) / Number(book.original_price));
}

function freshnessSignal(book: CatalogBook) {
  const ageMs = Date.now() - new Date(book.created_at).getTime();
  const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
  return Math.max(0, 1 - ageDays / 180);
}

export async function getFallbackRecommendations({
  userId,
  sid,
  limit = 12,
}: RecommendationFallbackInput) {
  const books = await listPublishedBooks(80);
  if (!books.length) return [] as CatalogBook[];

  const genreWeights = new Map<string, number>();
  const authorWeights = new Map<string, number>();
  const keywordWeights = new Map<string, number>();
  const seenBookIds = new Set<string>();

  const absorbBookSignal = (book: Partial<CatalogBook> | null | undefined, weight: number) => {
    if (!book) return;
    if (book.id) seenBookIds.add(book.id);
    addWeight(genreWeights, book.genre, weight);
    addWeight(authorWeights, book.author, weight * 1.15);
    for (const token of tokenize(`${book.title ?? ""} ${book.description ?? ""}`)) {
      addWeight(keywordWeights, token, weight * 0.18);
    }
  };

  const absorbInterestTokens = (values: string[] | null | undefined, weight: number) => {
    for (const token of (values ?? []).flatMap((value) => tokenize(value))) {
      addWeight(keywordWeights, token, weight);
    }
  };

  const supabase = await createSupabaseServerClient();

  if (userId) {
    try {
      const [{ data: preferences }, { data: wishlist }, { data: orders }] = await Promise.all([
        supabase
          .from("customer_preferences")
          .select("favorite_genres,reading_interests")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("wishlist_items")
          .select("book_id,books(id,title,description,genre,author)")
          .order("created_at", { ascending: false })
          .limit(24),
        supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      for (const genre of preferences?.favorite_genres ?? []) {
        addWeight(genreWeights, genre, 2.2);
      }
      absorbInterestTokens(preferences?.reading_interests ?? [], 1.1);

      for (const row of wishlist ?? []) {
        absorbBookSignal((row as any).books, 2.4);
      }

      const orderIds = (orders ?? []).map((row: any) => row.id).filter(Boolean);
      if (orderIds.length) {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("book_id,title_snapshot,author_snapshot,books(id,title,description,genre,author)")
          .in("order_id", orderIds)
          .limit(48);

        for (const row of orderItems ?? []) {
          absorbBookSignal((row as any).books, 3.1);
        }
      }

      try {
        const { data: events } = await supabase
          .from("book_events")
          .select("book_id,event_type,event_weight,books(id,title,description,genre,author)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(40);

        for (const row of events ?? []) {
          const multiplier =
            row.event_type === "purchase"
              ? 3.2
              : row.event_type === "wishlist_add"
                ? 2.2
                : 1.3;
          absorbBookSignal((row as any).books, Number(row.event_weight ?? 1) * multiplier);
        }
      } catch {
        // The recommendation SQL layer may not be installed yet.
      }
    } catch {
      // Fall back to popularity-only scoring below.
    }
  } else if (sid) {
    try {
      const admin = createSupabaseAdminClient();
      const { data: events } = await admin
        .from("book_events")
        .select("book_id,event_type,event_weight,books(id,title,description,genre,author)")
        .eq("anon_session_id", sid)
        .order("created_at", { ascending: false })
        .limit(30);

      for (const row of events ?? []) {
        absorbBookSignal((row as any).books, Number(row.event_weight ?? 1) * 1.35);
      }
    } catch {
      // Ignore when anonymous session history doesn't exist yet.
    }
  }

  const scored = books
    .filter((book) => book.stock > 0 && !seenBookIds.has(book.id))
    .map((book) => {
      const haystack = `${book.title} ${book.description}`.toLowerCase();
      let keywordScore = 0;
      for (const [token, weight] of keywordWeights) {
        if (haystack.includes(token)) keywordScore += weight;
      }

      const popularityScore =
        (book.is_featured ? 1.1 : 0) +
        Math.log1p(Math.max(0, Number(book.rating_count ?? 0))) * 0.55 +
        Number(book.average_rating ?? 0) * 0.22 +
        freshnessSignal(book) * 0.35 +
        priceSignal(book);

      const score =
        popularityScore +
        normalizeMapScore(genreWeights, book.genre) * 2.0 +
        normalizeMapScore(authorWeights, book.author) * 2.4 +
        Math.min(keywordScore, 2.2);

      return { book, score };
    })
    .sort((a, b) => b.score - a.score);

  if (!genreWeights.size && !authorWeights.size && !keywordWeights.size) {
    return books
      .filter((book) => book.stock > 0)
      .sort((a, b) => {
        const aScore =
          (a.is_featured ? 1 : 0) +
          Math.log1p(Math.max(0, Number(a.rating_count ?? 0))) * 0.55 +
          Number(a.average_rating ?? 0) * 0.2 +
          freshnessSignal(a) * 0.3;
        const bScore =
          (b.is_featured ? 1 : 0) +
          Math.log1p(Math.max(0, Number(b.rating_count ?? 0))) * 0.55 +
          Number(b.average_rating ?? 0) * 0.2 +
          freshnessSignal(b) * 0.3;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  return scored.slice(0, limit).map((item) => item.book);
}

