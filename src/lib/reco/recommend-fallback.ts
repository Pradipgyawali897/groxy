import "server-only";

import { listPublishedBooks } from "@/lib/catalog";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogBook } from "@/types/platform";

type RecommendationFallbackInput = {
  userId?: string | null;
  sid?: string | null;
  limit?: number;
  candidateBooks?: CatalogBook[];
  excludeSeen?: boolean;
  preserveOrder?: boolean;
};

type RecommendationSignalState = {
  genreWeights: Map<string, number>;
  authorWeights: Map<string, number>;
  keywordWeights: Map<string, number>;
  seenBookIds: Set<string>;
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

async function collectSignals(userId?: string | null, sid?: string | null): Promise<RecommendationSignalState> {
  const signals: RecommendationSignalState = {
    genreWeights: new Map<string, number>(),
    authorWeights: new Map<string, number>(),
    keywordWeights: new Map<string, number>(),
    seenBookIds: new Set<string>(),
  };

  const absorbBookSignal = (book: Partial<CatalogBook> | null | undefined, weight: number) => {
    if (!book) return;
    if (book.id) signals.seenBookIds.add(book.id);
    addWeight(signals.genreWeights, book.genre, weight);
    addWeight(signals.authorWeights, book.author, weight * 1.15);
    for (const token of tokenize(`${book.title ?? ""} ${book.description ?? ""}`)) {
      addWeight(signals.keywordWeights, token, weight * 0.18);
    }
  };

  const absorbInterestTokens = (values: string[] | null | undefined, weight: number) => {
    for (const token of (values ?? []).flatMap((value) => tokenize(value))) {
      addWeight(signals.keywordWeights, token, weight);
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
          .from("wishlists")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      for (const genre of preferences?.favorite_genres ?? []) {
        addWeight(signals.genreWeights, genre, 2.2);
      }
      absorbInterestTokens(preferences?.reading_interests ?? [], 1.1);

      if (wishlist?.id) {
        const { data: wishlistItems } = await supabase
          .from("wishlist_items")
          .select("book_id,books(id,title,description,genre,author)")
          .eq("wishlist_id", wishlist.id)
          .order("created_at", { ascending: false })
          .limit(24);

        for (const row of wishlistItems ?? []) {
          absorbBookSignal((row as any).books, 2.4);
        }
      }

      const orderIds = (orders ?? []).map((row: any) => row.id).filter(Boolean);
      if (orderIds.length) {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("book_id,books(id,title,description,genre,author)")
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

  return signals;
}

function buildRecommendationReason({
  book,
  genreScore,
  authorScore,
  matchedKeyword,
  hasPersonalSignals,
}: {
  book: CatalogBook;
  genreScore: number;
  authorScore: number;
  matchedKeyword?: string;
  hasPersonalSignals: boolean;
}) {
  if (hasPersonalSignals && authorScore >= 0.82) {
    return `Because you keep engaging with ${book.author}`;
  }
  if (hasPersonalSignals && genreScore >= 0.76) {
    return `Because you read ${book.genre.toLowerCase()} books`;
  }
  if (hasPersonalSignals && matchedKeyword) {
    return `Because it matches your interest in ${matchedKeyword}`;
  }
  if (book.is_featured) {
    return "Featured in the bookstore right now";
  }
  if (freshnessSignal(book) >= 0.65) {
    return "Freshly added to the catalog";
  }
  return "Trending with bookstore readers";
}

export async function getFallbackRecommendations({
  userId,
  sid,
  limit = 12,
  candidateBooks,
  excludeSeen = true,
  preserveOrder = false,
}: RecommendationFallbackInput) {
  const books = candidateBooks?.length ? candidateBooks : await listPublishedBooks(80);
  if (!books.length) return [] as CatalogBook[];

  const { genreWeights, authorWeights, keywordWeights, seenBookIds } = await collectSignals(userId, sid);
  const hasPersonalSignals = Boolean(genreWeights.size || authorWeights.size || keywordWeights.size);

  const candidates = books.filter(
    (book) => book.stock > 0 && (!excludeSeen || !seenBookIds.has(book.id))
  );
  const pool = candidates.length ? candidates : books.filter((book) => book.stock > 0);

  const scored = pool
    .map((book) => {
      const haystack = `${book.title} ${book.description}`.toLowerCase();
      let keywordScore = 0;
      let matchedKeyword = "";
      for (const [token, weight] of keywordWeights) {
        if (haystack.includes(token)) {
          keywordScore += weight;
          if (!matchedKeyword) matchedKeyword = token;
        }
      }

      const popularityScore =
        (book.is_featured ? 1.1 : 0) +
        Math.log1p(Math.max(0, Number(book.rating_count ?? 0))) * 0.55 +
        Number(book.average_rating ?? 0) * 0.22 +
        freshnessSignal(book) * 0.35 +
        priceSignal(book);
      const genreScore = normalizeMapScore(genreWeights, book.genre);
      const authorScore = normalizeMapScore(authorWeights, book.author);

      const score =
        popularityScore +
        genreScore * 2.0 +
        authorScore * 2.4 +
        Math.min(keywordScore, 2.2);

      return {
        book: {
          ...book,
          recommendation_reason: buildRecommendationReason({
            book,
            genreScore,
            authorScore,
            matchedKeyword,
            hasPersonalSignals,
          }),
        },
        score,
      };
    })
    .sort((a, b) => (preserveOrder ? 0 : b.score - a.score));

  if (!hasPersonalSignals) {
    const base = pool.filter((book) => book.stock > 0);
    const ranked = preserveOrder
      ? base
      : [...base].sort((a, b) => {
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
      });
    const popular = ranked
      .slice(0, limit)
      .map((book) => ({
        ...book,
        recommendation_reason: book.is_featured
          ? "Featured in the bookstore right now"
          : freshnessSignal(book) >= 0.65
            ? "Freshly added to the catalog"
            : "Trending with bookstore readers",
      }));
    return popular;
  }

  return scored.slice(0, limit).map((item) => item.book);
}
