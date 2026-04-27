"use client";

import * as React from "react";

import { BookCard } from "@/features/catalog/book-card";
import { SectionHeading } from "@/features/shared/section-heading";
import { cn } from "@/lib/utils";
import type { CatalogBook } from "@/types/platform";

type ConciergeTheme = {
  id: string;
  label: string;
  title: string;
  description: string;
  note: string;
  books: CatalogBook[];
};

type ConciergeResponse = {
  themes: ConciergeTheme[];
};

export function BookConcierge() {
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string;
    themes: ConciergeTheme[];
  }>({ loading: true, error: "", themes: [] });
  const [activeThemeId, setActiveThemeId] = React.useState("");
  const mountedRef = React.useRef(true);

  const load = React.useCallback(async () => {
    if (!mountedRef.current) return;
    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);
      const response = await fetch("/api/recommendations/concierge", {
        cache: "no-store",
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      const json = (await response.json().catch(() => null)) as
        | ConciergeResponse
        | { error?: string }
        | null;

      if (!mountedRef.current) return;

      if (!response.ok) {
        setState({
          loading: false,
          error: (json as { error?: string } | null)?.error ?? "Could not load concierge picks.",
          themes: [],
        });
        return;
      }

      const themes = Array.isArray((json as ConciergeResponse | null)?.themes)
        ? ((json as ConciergeResponse).themes ?? [])
        : [];

      setState({ loading: false, error: "", themes });
      React.startTransition(() => {
        setActiveThemeId((current) =>
          themes.some((theme) => theme.id === current) ? current : (themes[0]?.id ?? "")
        );
      });
    } catch {
      if (!mountedRef.current) return;
      setState({
        loading: false,
        error: "Concierge unavailable right now. Try again.",
        themes: [],
      });
    }
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    void load();

    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  const activeTheme = state.themes.find((theme) => theme.id === activeThemeId) ?? state.themes[0] ?? null;

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Book concierge"
        title="Pick a reading direction, not just another shelf"
        description="These short routes are shaped from your live recommendation pool so you can decide whether to double down, pivot, or take the easy win."
      />

      {state.loading ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-11 w-40 animate-pulse rounded-full border border-border/70 bg-card/80"
              />
            ))}
          </div>
          <div className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 shadow-sm">
            <div className="space-y-3">
              <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
              <div className="h-8 w-72 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-muted" />
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[420px] animate-pulse rounded-[1.75rem] border border-border/70 bg-card/80"
                />
              ))}
            </div>
          </div>
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
      ) : !activeTheme ? (
        <div className="rounded-[1.75rem] border border-dashed border-border bg-card/70 p-8 text-center">
          <p className="text-sm text-muted-foreground">No concierge routes are ready yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3" role="tablist" aria-label="Concierge themes">
            {state.themes.map((theme) => {
              const selected = theme.id === activeTheme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    React.startTransition(() => {
                      setActiveThemeId(theme.id);
                    });
                  }}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition",
                    selected
                      ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                      : "border-border/70 bg-card/70 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  )}
                >
                  {theme.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/80">
                  {activeTheme.label}
                </p>
                <h3 className="font-heading text-3xl tracking-tight text-foreground">
                  {activeTheme.title}
                </h3>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {activeTheme.description}
                </p>
              </div>
              {activeTheme.note ? (
                <p className="max-w-md rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {activeTheme.note}
                </p>
              ) : null}
            </div>

            <div className="mt-6">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {activeTheme.books.map((book) => (
                  <BookCard key={book.id} book={book} compact />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
