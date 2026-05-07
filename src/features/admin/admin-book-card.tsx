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
    <article className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border/50 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-medium">{book.title}</p>
        <p className="truncate text-xs text-muted-foreground">{book.author}</p>
      </div>

      <div className="flex items-center gap-2">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} disabled={pending} className="h-8 text-xs">
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-xs">
          Feature
          <input type="checkbox" className="h-4 w-4" checked={featured} onChange={(e) => setFeatured(e.target.checked)} disabled={pending} />
        </label>
        <Input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="h-8 w-16 text-xs" disabled={pending} />
        <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="h-8 w-20 text-xs" disabled={pending} />
        <Button onClick={onSave} disabled={pending} size="sm" variant="outline">Save</Button>
        <Button variant="ghost" onClick={onDelete} disabled={pending} size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
      </div>
      {error ? <p className="col-span-2 text-[10px] text-destructive">{error}</p> : null}
    </article>
  );
}
