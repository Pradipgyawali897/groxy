"use client";

import Image from "next/image";
import * as React from "react";

import { BOOK_CONDITIONS, BOOK_STATUSES, type BookRecord } from "@/lib/books";
import { normalizeCloudinaryUrl } from "@/lib/books";
import { Button } from "@/components/ui/button";

const defaultForm = {
  title: "",
  author: "",
  description: "",
  genre: "Fiction",
  book_condition: "good",
  language: "English",
  price: 12.99,
  original_price: "",
  stock: 1,
  cover_image_url:
    "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
  gallery_urls_text: "",
  status: "draft",
  is_featured: false,
};

type FormState = typeof defaultForm;

function coercePayload(form: FormState) {
  return {
    title: form.title,
    author: form.author,
    description: form.description,
    genre: form.genre,
    book_condition: form.book_condition,
    language: form.language,
    price: Number(form.price),
    original_price:
      form.original_price === "" ? null : Number(form.original_price),
    stock: Number(form.stock),
    cover_image_url: form.cover_image_url,
    gallery_urls: form.gallery_urls_text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    status: form.status,
    is_featured: form.is_featured,
  };
}

export function MerchantStudio({ initialBooks }: { initialBooks: BookRecord[] }) {
  const [books, setBooks] = React.useState<BookRecord[]>(initialBooks);
  const [form, setForm] = React.useState<FormState>(defaultForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [preview, setPreview] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const payload = coercePayload(form);
    const endpoint = editingId
      ? `/api/merchant/books/${editingId}`
      : "/api/merchant/books";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Unable to save book.");
      return;
    }

    if (editingId) {
      setBooks((prev) => prev.map((book) => (book.id === editingId ? json.book : book)));
      setMessage("Book updated.");
    } else {
      setBooks((prev) => [json.book, ...prev]);
      setMessage("Book created.");
    }

    resetForm();
  };

  const onEdit = (book: BookRecord) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description,
      genre: book.genre,
      book_condition: book.book_condition,
      language: book.language,
      price: book.price,
      original_price: book.original_price ? String(book.original_price) : "",
      stock: book.stock,
      cover_image_url: book.cover_image_url,
      gallery_urls_text: book.gallery_urls.join(", "),
      status: book.status,
      is_featured: book.is_featured,
    });
  };

  const onDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this book?");
    if (!confirmed) return;
    const res = await fetch(`/api/merchant/books/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Delete failed.");
      return;
    }
    setBooks((prev) => prev.filter((book) => book.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-2xl border border-border/70 bg-card/80 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit listing" : "Create listing"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Merchant CRUD with Cloudinary image fields and publish controls.
            </p>
          </div>
          <button
            className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
            onClick={() => setPreview((prev) => !prev)}
          >
            {preview ? "Form view" : "Preview view"}
          </button>
        </div>

        {preview ? (
          <div className="rounded-xl border border-border/70 bg-background p-4">
            <Image
              src={normalizeCloudinaryUrl(form.cover_image_url, 900)}
              alt={form.title || "Preview"}
              width={1100}
              height={700}
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="h-72 w-full rounded-lg object-cover"
            />
            <h3 className="mt-3 text-xl font-semibold">{form.title || "Book title"}</h3>
            <p className="text-sm text-muted-foreground">by {form.author || "Author"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {form.description || "Book description preview will appear here."}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Title"
                value={form.title}
                onChange={(event) => onChange("title", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              />
              <input
                required
                placeholder="Author"
                value={form.author}
                onChange={(event) => onChange("author", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              />
            </div>
            <textarea
              required
              rows={5}
              placeholder="Description"
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
            />
            <div className="grid gap-3 sm:grid-cols-4">
              <select
                value={form.genre}
                onChange={(event) => onChange("genre", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              >
                {[
                  "Fiction",
                  "Non-fiction",
                  "Science",
                  "Technology",
                  "Business",
                  "History",
                  "Poetry",
                ].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={form.book_condition}
                onChange={(event) => onChange("book_condition", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              >
                {BOOK_CONDITIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace("_", " ")}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => onChange("price", Number(event.target.value))}
                placeholder="Price"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.original_price}
                onChange={(event) => onChange("original_price", event.target.value)}
                placeholder="Original price"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                placeholder="Language"
                value={form.language}
                onChange={(event) => onChange("language", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              />
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) => onChange("stock", Number(event.target.value))}
                placeholder="Stock"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              />
              <select
                value={form.status}
                onChange={(event) => onChange("status", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              >
                {BOOK_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <input
              required
              placeholder="Cloudinary cover URL"
              value={form.cover_image_url}
              onChange={(event) => onChange("cover_image_url", event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
            />
            <input
              placeholder="Gallery URLs (comma separated)"
              value={form.gallery_urls_text}
              onChange={(event) => onChange("gallery_urls_text", event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
            />
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) => onChange("is_featured", event.target.checked)}
              />
              Feature this book on landing highlights
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update listing"
                    : "Create listing"}
              </Button>
              {editingId ? (
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
                  onClick={resetForm}
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-border/70 bg-card/80 p-5">
        <h2 className="text-lg font-semibold">Your inventory</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {books.length} listings with quick preview and management controls.
        </p>
        <div className="space-y-3">
          {books.map((book) => (
            <article
              key={book.id}
              className="rounded-xl border border-border/70 bg-background p-3"
            >
              <div className="flex gap-3">
                <Image
                  src={normalizeCloudinaryUrl(book.cover_image_url, 180)}
                  alt={book.title}
                  width={120}
                  height={160}
                  sizes="64px"
                  className="h-24 w-16 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {book.status} • ${book.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                  onClick={() => onEdit(book)}
                >
                  Edit
                </button>
                <button
                  className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                  onClick={() => onDelete(book.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
