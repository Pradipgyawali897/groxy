import { NextResponse } from "next/server";
import { z } from "zod";

import { getFallbackRecommendations } from "@/lib/reco/recommend-fallback";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogBook } from "@/types/platform";

const querySchema = z.object({
  limit: z.coerce.number().int().min(9).max(24).default(15),
});

const THEME_BOOK_LIMIT = 3;

type ConciergeTheme = {
  id: string;
  label: string;
  title: string;
  description: string;
  note: string;
  books: CatalogBook[];
};

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

function uniqueBooks(books: CatalogBook[]) {
  const seen = new Set<string>();
  return books.filter((book) => {
    if (seen.has(book.id)) return false;
    seen.add(book.id);
    return true;
  });
}

function numeric(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function ratingSignal(book: CatalogBook) {
  return numeric(book.average_rating) * 0.65 + Math.log1p(Math.max(0, numeric(book.rating_count))) * 0.55;
}

function freshnessScore(book: CatalogBook) {
  const ageMs = Date.now() - new Date(book.created_at).getTime();
  const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
  return Math.max(0, 1 - ageDays / 180);
}

function discountAmount(book: CatalogBook) {
  const original = numeric(book.original_price);
  const price = numeric(book.price);
  if (!original || original <= price) return 0;
  return original - price;
}

function discountRatio(book: CatalogBook) {
  const original = numeric(book.original_price);
  if (!original) return 0;
  return discountAmount(book) / original;
}

function personalSignalScore(book: CatalogBook) {
  const reason = book.recommendation_reason?.toLowerCase() ?? "";
  if (reason.includes("keep engaging")) return 3.2;
  if (reason.includes("because you read")) return 2.7;
  if (reason.includes("matches your interest")) return 2.1;
  return 0;
}

function topGenre(books: CatalogBook[]) {
  const counts = new Map<string, number>();
  for (const book of books) {
    counts.set(book.genre, (counts.get(book.genre) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function medianPrice(books: CatalogBook[]) {
  const prices = books.map((book) => numeric(book.price)).sort((a, b) => a - b);
  if (!prices.length) return 0;

  const middle = Math.floor(prices.length / 2);
  if (prices.length % 2 === 0) {
    return (prices[middle - 1] + prices[middle]) / 2;
  }

  return prices[middle] ?? 0;
}

function selectThemeBooks({
  source,
  preferred,
  usedIds,
  limit = THEME_BOOK_LIMIT,
}: {
  source: CatalogBook[];
  preferred?: (book: CatalogBook) => boolean;
  usedIds: Set<string>;
  limit?: number;
}) {
  const selected: CatalogBook[] = [];
  const selectedIds = new Set<string>();

  const append = (candidates: CatalogBook[]) => {
    for (const book of candidates) {
      if (selected.length >= limit) return;
      if (selectedIds.has(book.id)) continue;
      selected.push(book);
      selectedIds.add(book.id);
    }
  };

  if (preferred) {
    append(source.filter((book) => preferred(book) && !usedIds.has(book.id)));
  }
  append(source.filter((book) => !usedIds.has(book.id)));
  if (preferred) {
    append(source.filter((book) => preferred(book)));
  }
  append(source);

  const finalSelection = selected.slice(0, limit);
  for (const book of finalSelection) {
    usedIds.add(book.id);
  }

  return finalSelection;
}

function annotateBooks(
  books: CatalogBook[],
  getReason: (book: CatalogBook, index: number) => string
) {
  return books.map((book, index) => ({
    ...book,
    recommendation_reason: getReason(book, index),
  }));
}

function buildConciergeThemes(books: CatalogBook[]): ConciergeTheme[] {
  const pool = uniqueBooks(books.filter((book) => book.stock > 0));
  if (!pool.length) return [];

  const primaryGenre = topGenre(pool.slice(0, 8)) ?? pool[0]?.genre ?? null;
  const baseMedianPrice = medianPrice(pool);
  const usedIds = new Set<string>();

  const familiarSource = [...pool].sort((a, b) => {
    const aScore =
      personalSignalScore(a) +
      (primaryGenre && a.genre === primaryGenre ? 1.1 : 0) +
      ratingSignal(a) +
      freshnessScore(a) * 0.45;
    const bScore =
      personalSignalScore(b) +
      (primaryGenre && b.genre === primaryGenre ? 1.1 : 0) +
      ratingSignal(b) +
      freshnessScore(b) * 0.45;
    return bScore - aScore;
  });

  const familiarBooks = annotateBooks(
    selectThemeBooks({
      source: familiarSource,
      preferred: primaryGenre ? (book) => book.genre === primaryGenre : undefined,
      usedIds,
    }),
    (book) =>
      book.recommendation_reason ||
      (primaryGenre
        ? `Strong fit if you want to stay close to ${primaryGenre}.`
        : "Strong fit if you want the cleanest match.")
  );

  const adjacentPool = pool.filter((book) => !usedIds.has(book.id));
  const adjacentSourceBase = adjacentPool.length ? adjacentPool : pool;
  const adjacentGenre =
    topGenre(adjacentSourceBase.filter((book) => book.genre !== primaryGenre)) ??
    topGenre(adjacentSourceBase) ??
    null;
  const adjacentSource = [...adjacentSourceBase].sort((a, b) => {
    const aScore =
      freshnessScore(a) * 1.2 +
      ratingSignal(a) +
      (adjacentGenre && a.genre === adjacentGenre ? 1 : 0) +
      (primaryGenre && a.genre !== primaryGenre ? 0.55 : 0) +
      (a.is_featured ? 0.25 : 0);
    const bScore =
      freshnessScore(b) * 1.2 +
      ratingSignal(b) +
      (adjacentGenre && b.genre === adjacentGenre ? 1 : 0) +
      (primaryGenre && b.genre !== primaryGenre ? 0.55 : 0) +
      (b.is_featured ? 0.25 : 0);
    return bScore - aScore;
  });

  const adjacentBooks = annotateBooks(
    selectThemeBooks({
      source: adjacentSource,
      preferred: (book) =>
        (adjacentGenre ? book.genre === adjacentGenre : true) &&
        (primaryGenre ? book.genre !== primaryGenre : true),
      usedIds,
    }),
    (book, index) =>
      index === 0
        ? `Concierge pick: a fresh ${book.genre.toLowerCase()} detour`
        : "Concierge pick: same mood, different shelf"
  );

  const valuePool = pool.filter((book) => !usedIds.has(book.id));
  const valueSourceBase = valuePool.length ? valuePool : pool;
  const valueSource = [...valueSourceBase].sort((a, b) => {
    const aScore =
      discountRatio(a) * 3.4 +
      ratingSignal(a) +
      freshnessScore(a) * 0.35 +
      (numeric(a.price) <= baseMedianPrice ? 0.8 : 0) -
      numeric(a.price) * 0.03;
    const bScore =
      discountRatio(b) * 3.4 +
      ratingSignal(b) +
      freshnessScore(b) * 0.35 +
      (numeric(b.price) <= baseMedianPrice ? 0.8 : 0) -
      numeric(b.price) * 0.03;
    return bScore - aScore;
  });

  const valueBooks = annotateBooks(
    selectThemeBooks({
      source: valueSource,
      preferred: (book) => discountAmount(book) > 0 || numeric(book.price) <= baseMedianPrice,
      usedIds,
    }),
    (book) => {
      const discount = discountAmount(book);
      if (discount > 0) {
        return `Value pick: save $${discount.toFixed(2)} right now`;
      }
      if (numeric(book.price) <= baseMedianPrice) {
        return "Concierge pick: strong signal, lighter spend";
      }
      return "Concierge pick: high-conviction next buy";
    }
  );

  const themes: ConciergeTheme[] = [];

  if (familiarBooks.length) {
    themes.push({
      id: "follow-the-thread",
      label: "Follow the thread",
      title: primaryGenre ? `Stay with the ${primaryGenre} signal` : "Stay with your strongest signal",
      description: primaryGenre
        ? `The clearest pattern in your activity still points to ${primaryGenre.toLowerCase()}, so these picks keep the fit tight.`
        : "These are the closest matches from your live recommendation pool right now.",
      note: familiarBooks[0]
        ? `Start with ${familiarBooks[0].title} if you want the cleanest fit.`
        : "",
      books: familiarBooks,
    });
  }

  if (adjacentBooks.length) {
    themes.push({
      id: "one-shelf-over",
      label: "One shelf over",
      title: adjacentGenre
        ? `${adjacentGenre}, but a little less expected`
        : "A fresh lane that still fits",
      description:
        "Same overall energy, but enough distance from your usual shelf to keep discovery honest.",
      note: adjacentBooks[0]
        ? `${adjacentBooks[0].title} is the easiest pivot if you want something adjacent.`
        : "",
      books: adjacentBooks,
    });
  }

  if (valueBooks.length) {
    const leadBook = valueBooks[0];
    const leadDiscount = leadBook ? discountAmount(leadBook) : 0;

    themes.push({
      id: "easy-yes",
      label: "Easy yes",
      title: "Low-friction next buy",
      description:
        "These picks balance value, ratings, and ready-to-cart energy so acting on a recommendation feels easier.",
      note: leadBook
        ? leadDiscount > 0
          ? `Best value in the set: save $${leadDiscount.toFixed(2)} on ${leadBook.title}.`
          : `${leadBook.title} is the safest next add if you want a lighter-spend win.`
        : "",
      books: valueBooks,
    });
  }

  return themes;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sid = getSidFromCookie(request.headers.get("cookie"));
  if (!sid) sid = crypto.randomUUID();

  const books = await getFallbackRecommendations({
    userId: user?.id ?? null,
    sid,
    limit: parsed.data.limit,
  });

  const isSecure = new URL(request.url).protocol === "https:";
  const themes = buildConciergeThemes(books);

  return NextResponse.json(
    { themes },
    { headers: { "Set-Cookie": buildSetSidCookie(sid, isSecure) } }
  );
}
