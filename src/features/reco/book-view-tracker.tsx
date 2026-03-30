"use client";

import * as React from "react";

export function BookViewTracker({
  bookId,
  surface = "book_detail",
}: {
  bookId: string;
  surface?: string;
}) {
  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fire = async () => {
      try {
        await fetch("/api/events/view", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-pathname": window.location.pathname,
          },
          body: JSON.stringify({ book_id: bookId, surface }),
          signal: controller.signal,
          keepalive: true,
        });
      } catch {
        // ignore tracking failures
      }
    };

    // delay slightly to avoid logging bounces
    const t = window.setTimeout(() => {
      if (!cancelled) void fire();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      controller.abort();
    };
  }, [bookId, surface]);

  return null;
}

