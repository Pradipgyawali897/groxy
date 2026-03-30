"use client";

import * as React from "react";

import type { CatalogBook } from "@/types/platform";

import { BookCard } from "./book-card";

export function BookFeed({
  books,
  compact = false,
  batchSize = 8,
  label = "Book feed",
}: {
  books: CatalogBook[];
  compact?: boolean;
  batchSize?: number;
  label?: string;
}) {
  const [visibleCount, setVisibleCount] = React.useState(() =>
    Math.min(batchSize, books.length)
  );
  const [loadingMore, setLoadingMore] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setVisibleCount(Math.min(batchSize, books.length));
  }, [books.length, batchSize]);

  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= books.length) return;

    let timeoutId: number | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || loadingMore) return;

        setLoadingMore(true);
        timeoutId = window.setTimeout(() => {
          setVisibleCount((count) => Math.min(count + batchSize, books.length));
          setLoadingMore(false);
        }, 180);
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [visibleCount, books.length, batchSize, loadingMore]);

  const visibleBooks = books.slice(0, visibleCount);
  const hasMore = visibleCount < books.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-card/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            More books appear as you scroll, so the catalog feels like a live reading feed.
          </p>
        </div>
        <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{visibleBooks.length}</span> of{" "}
          <span className="font-medium text-foreground">{books.length}</span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleBooks.map((book, index) => (
          <div
            key={book.id}
            className="animate-fade-in"
            style={{ animationDelay: `${(index % batchSize) * 45}ms` }}
          >
            <BookCard book={book} compact={compact} />
          </div>
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="flex min-h-20 items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-card/60 px-4 py-5 text-center"
      >
        {hasMore ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Keep scrolling for more titles</p>
            <p className="text-sm text-muted-foreground">
              {loadingMore ? "Loading the next shelf..." : "The next set of books will appear automatically."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">You reached the end of this shelf</p>
            <p className="text-sm text-muted-foreground">
              The feed has shown every available title in this view.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
