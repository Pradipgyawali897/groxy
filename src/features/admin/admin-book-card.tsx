"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BOOK_STATUSES } from "@/lib/books";
import type { CatalogBook } from "@/types/platform";

export function AdminBookCard({ book }: { book: CatalogBook }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(book.status);
  const [featured, setFeatured] = React.useState(Boolean(book.is_featured));
  const [stock, setStock] = React.useState(String(book.stock));
  const [price, setPrice] = React.useState(String(book.price));
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState("");

  const onSave = () => {
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/books/${book.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          is_featured: featured,
          stock: Number(stock),
          price: Number(price),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to update book.");
        return;
      }
      router.refresh();
    });
  };

  const onDelete = () => {
    setError("");
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/books/${book.id}`, { method: "DELETE" });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to delete book.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-2xl tracking-tight">{book.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {book.author} • <span className="font-medium">{status}</span>
          </p>
        </div>

        <div className="grid w-full gap-2 sm:max-w-[420px]">
          <div className="grid gap-2 sm:grid-cols-2">
            <Select value={status} onChange={(e) => setStatus(e.target.value)} disabled={pending}>
              {BOOK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
              <span>Featured</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                disabled={pending}
              />
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              type="number"
              min={0}
              step={1}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stock"
              className="h-12 rounded-2xl px-4"
              disabled={pending}
            />
            <Input
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="h-12 rounded-2xl px-4"
              disabled={pending}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onSave} disabled={pending} className="h-10 flex-1 rounded-xl">
              {pending ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              disabled={pending}
              className="h-10 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              Delete
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>
    </article>
  );
}

