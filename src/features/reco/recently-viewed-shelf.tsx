"use client";

import { BookShelf } from "@/features/reco/book-shelf";

export function RecentlyViewedShelf({
  limit = 8,
}: {
  limit?: number;
}) {
  return (
    <BookShelf
      eyebrow="History"
      title="Recently viewed"
      description="Pick up where you left off across the catalog."
      endpoint="/api/recently-viewed"
      limit={limit}
      compact
    />
  );
}

