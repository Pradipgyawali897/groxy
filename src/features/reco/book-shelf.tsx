"use client";

import * as React from "react";

import { BookGrid } from "@/features/catalog/book-grid";
import { SectionHeading } from "@/features/shared/section-heading";
import type { CatalogBook } from "@/types/platform";

type ApiResponse = { books: CatalogBook[] };

export function BookShelf({
  title,
  eyebrow,
  description,
  endpoint,
  limit = 8,
  compact = true,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  endpoint: string;
  limit?: number;
  compact?: boolean;
}) {
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string;
    books: CatalogBook[];
  }>({ loading: true, error: "", books: [] });

  const load = React.useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const controller = new AbortController();
      const t = window.setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${endpoint}${endpoint.includes("?") ? "&" : "?"}limit=${limit}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      window.clearTimeout(t);

      const json = (await res.json().catch(() => null)) as ApiResponse | { error?: string } | null;
      if (!res.ok) {
        setState({
          loading: false,
          error: (json as any)?.error ?? `Failed to load (${res.status}).`,
          books: [],
        });
        return;
      }

      const books = Array.isArray((json as any)?.books) ? ((json as any).books as CatalogBook[]) : [];
      setState({ loading: false, error: "", books });
    } catch {
      setState({ loading: false, error: "Request timed out. Try again.", books: [] });
    }
  }, [endpoint, limit]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="space-y-6">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      {state.loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: Math.min(limit, 8) }).map((_, idx) => (
            <div
              key={idx}
              className="h-[420px] animate-pulse rounded-[1.75rem] border border-border/70 bg-card/80"
            />
          ))}
        </div>
      ) : state.error ? (
        <div className="rounded-[1.75rem] border border-dashed border-border bg-card/70 p-8 text-center">
          <p className="text-sm text-muted-foreground">{state.error}</p>
          <button
            onClick={() => void load()}
            className="mt-4 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm text-primary-foreground"
          >
            Retry
          </button>
        </div>
      ) : state.books.length ? (
        <BookGrid books={state.books} compact={compact} />
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-border bg-card/70 p-8 text-center">
          <p className="text-sm text-muted-foreground">No results yet.</p>
        </div>
      )}
    </section>
  );
}
