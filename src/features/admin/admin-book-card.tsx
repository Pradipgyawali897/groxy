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
    <article className="grid gap-3 border-b border-border px-4 py-4 last:border-b-0 xl:grid-cols-[1fr_520px] xl:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium">{book.title}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{book.author}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-[130px_108px_86px_98px_1fr]">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} disabled={pending}>
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <label className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <span>Feature</span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            disabled={pending}
          />
        </label>
        <Input
          type="number"
          min={0}
          step={1}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          className="h-10 rounded-md px-3"
          disabled={pending}
        />
        <Input
          type="number"
          min={0}
          step={0.01}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="h-10 rounded-md px-3"
          disabled={pending}
        />
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={pending} className="h-10 flex-1 rounded-md">
            {pending ? "Saving" : "Save"}
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            disabled={pending}
            className="h-10 rounded-md border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            Delete
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive sm:col-span-5">{error}</p> : null}
      </div>
    </article>
  );
}
