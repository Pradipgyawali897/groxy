"use client";

import { BookShelf } from "@/features/reco/book-shelf";

export function TrendingShelf({ limit = 8 }: { limit?: number }) {
  return (
    <BookShelf
      eyebrow="Trending"
      title="Trending now"
      description="High-signal books rising from views, wishlists, and purchases."
      endpoint="/api/trending"
      limit={limit}
      compact
    />
  );
}

