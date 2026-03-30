"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BOOK_CONDITIONS, BOOK_STATUSES, merchantBookSchema } from "@/lib/books";
import { APP_ROUTES } from "@/lib/roles";
import type { CatalogBook } from "@/types/platform";

function splitUrlList(value: string) {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function MerchantBookEditor({
  mode,
  book,
}: {
  mode: "create" | "edit";
  book?: CatalogBook | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState("");

  const [title, setTitle] = React.useState(book?.title ?? "");
  const [author, setAuthor] = React.useState(book?.author ?? "");
  const [description, setDescription] = React.useState(book?.description ?? "");
  const [genre, setGenre] = React.useState(book?.genre ?? "");
  const [bookCondition, setBookCondition] = React.useState<string>(
    book?.book_condition ?? "good"
  );
  const [language, setLanguage] = React.useState<string>(book?.language ?? "English");
  const [price, setPrice] = React.useState(String(book?.price ?? ""));
  const [originalPrice, setOriginalPrice] = React.useState(
    book?.original_price != null ? String(book.original_price) : ""
  );
  const [stock, setStock] = React.useState(String(book?.stock ?? 1));
  const [coverImageUrl, setCoverImageUrl] = React.useState(book?.cover_image_url ?? "");
  const [galleryUrls, setGalleryUrls] = React.useState(
    (book?.gallery_urls ?? []).join("\n")
  );
  const [status, setStatus] = React.useState<string>(book?.status ?? "draft");
  const [featured, setFeatured] = React.useState<boolean>(Boolean(book?.is_featured));

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const payload = {
      title,
      author,
      description,
      genre,
      book_condition: bookCondition,
      language,
      price: Number(price),
      original_price: originalPrice.length ? Number(originalPrice) : null,
      stock: Number(stock),
      cover_image_url: coverImageUrl,
      gallery_urls: splitUrlList(galleryUrls),
      status,
      is_featured: featured,
    };

    const parsed = merchantBookSchema.safeParse(payload);
    if (!parsed.success) {
      setError("Please fix the form fields and try again.");
      return;
    }

    startTransition(async () => {
      const endpoint =
        mode === "create" ? "/api/merchant/books" : `/api/merchant/books/${book?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = (await res.json()) as { error?: string; issues?: unknown };
      if (!res.ok) {
        setError(json.error ?? "Failed to save book.");
        return;
      }

      router.push(APP_ROUTES.merchantBooks);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="h-12 rounded-2xl px-4"
            disabled={pending}
          />
          <Input
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="h-12 rounded-2xl px-4"
            disabled={pending}
          />
        </div>

        <Textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (20+ characters)"
          className="rounded-2xl"
          disabled={pending}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            required
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
            className="h-12 rounded-2xl px-4"
            disabled={pending}
          />
          <Select
            value={bookCondition}
            onChange={(e) => setBookCondition(e.target.value)}
            disabled={pending}
          >
            {BOOK_CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </Select>
          <Input
            required
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Language"
            className="h-12 rounded-2xl px-4"
            disabled={pending}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            required
            type="number"
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className="h-12 rounded-2xl px-4"
            disabled={pending}
          />
          <Input
            type="number"
            min={0}
            step={0.01}
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="Original price (optional)"
            className="h-12 rounded-2xl px-4"
            disabled={pending}
          />
          <Input
            required
            type="number"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Stock"
            className="h-12 rounded-2xl px-4"
            disabled={pending}
          />
        </div>

        <Input
          required
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="Cover image URL"
          className="h-12 rounded-2xl px-4"
          disabled={pending}
        />

        <Textarea
          value={galleryUrls}
          onChange={(e) => setGalleryUrls(e.target.value)}
          placeholder="Gallery image URLs (one per line, optional)"
          className="rounded-2xl"
          disabled={pending}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} disabled={pending}>
            {BOOK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm sm:col-span-2">
            <span>Featured listing</span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              disabled={pending}
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" className="h-12 rounded-2xl" disabled={pending}>
          {pending ? "Saving..." : mode === "create" ? "Create listing" : "Save changes"}
        </Button>
        <Link
          href={APP_ROUTES.merchantBooks}
          className="inline-flex h-12 items-center rounded-2xl border border-border bg-card/80 px-5 text-sm text-foreground hover:bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
