"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

type Book = {
  id: string;
  title: string;
  author: string;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  stock: number;
  price: number;
  seller_email: string;
};

type Stats = {
  books: number;
  customers: number;
  merchants: number;
  admins: number;
  inquiries: number;
};

type CustomerProfile = {
  user_id: string;
  display_name: string;
  shipping_city: string | null;
};

type MerchantProfile = {
  user_id: string;
  store_name: string;
  business_email: string;
  city: string | null;
};

type AdminProfile = {
  user_id: string;
  display_name: string | null;
  work_email: string;
};

type AdminSnapshot = {
  stats: Stats;
  books: Book[];
  customers: CustomerProfile[];
  merchants: MerchantProfile[];
  admins: AdminProfile[];
};

export function AdminPanel({ initial }: { initial: AdminSnapshot }) {
  const [state, setState] = React.useState(initial);
  const [loadingBookId, setLoadingBookId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [query, setQuery] = React.useState("");

  const filteredBooks = React.useMemo(() => {
    if (!query) return state.books;
    const q = query.toLowerCase();
    return state.books.filter((book) =>
      `${book.title} ${book.author} ${book.seller_email}`.toLowerCase().includes(q)
    );
  }, [query, state.books]);

  const updateBook = async (id: string, payload: Record<string, unknown>) => {
    setLoadingBookId(id);
    setError("");
    const res = await fetch(`/api/admin/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoadingBookId(null);
    if (!res.ok) {
      setError(json.error ?? "Failed to update book.");
      return;
    }
    setState((prev) => ({
      ...prev,
      books: prev.books.map((book) => (book.id === id ? json.book : book)),
    }));
  };

  const deleteBook = async (id: string) => {
    if (!window.confirm("Delete this listing?")) return;
    setLoadingBookId(id);
    setError("");
    const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    const json = await res.json();
    setLoadingBookId(null);
    if (!res.ok) {
      setError(json.error ?? "Failed to delete book.");
      return;
    }
    setState((prev) => ({
      ...prev,
      books: prev.books.filter((book) => book.id !== id),
      stats: {
        ...prev.stats,
        books: Math.max(0, prev.stats.books - 1),
      },
    }));
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-border/70 bg-card/80 p-4">
          <p className="text-sm text-muted-foreground">Books</p>
          <p className="mt-1 text-2xl font-semibold">{state.stats.books}</p>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/80 p-4">
          <p className="text-sm text-muted-foreground">Customers</p>
          <p className="mt-1 text-2xl font-semibold">{state.stats.customers}</p>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/80 p-4">
          <p className="text-sm text-muted-foreground">Merchants</p>
          <p className="mt-1 text-2xl font-semibold">{state.stats.merchants}</p>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/80 p-4">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="mt-1 text-2xl font-semibold">{state.stats.admins}</p>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/80 p-4">
          <p className="text-sm text-muted-foreground">Inquiries</p>
          <p className="mt-1 text-2xl font-semibold">{state.stats.inquiries}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Listing controls</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, author, seller email"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none sm:w-80"
          />
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-4 grid gap-3">
          {filteredBooks.map((book) => (
            <article
              key={book.id}
              className="rounded-xl border border-border/70 bg-background/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {book.author} • {book.seller_email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${book.price.toFixed(2)} • Stock {book.stock} • {book.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingBookId === book.id}
                    onClick={() =>
                      updateBook(book.id, {
                        status: book.status === "published" ? "archived" : "published",
                      })
                    }
                  >
                    {book.status === "published" ? "Archive" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingBookId === book.id}
                    onClick={() =>
                      updateBook(book.id, { is_featured: !book.is_featured })
                    }
                  >
                    {book.is_featured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={loadingBookId === book.id}
                    onClick={() => deleteBook(book.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {filteredBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listings match this filter.</p>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
          <h3 className="text-base font-semibold">Recent customers</h3>
          <div className="mt-3 space-y-2">
            {state.customers.slice(0, 8).map((customer) => (
              <div key={customer.user_id} className="rounded-lg border border-border/60 p-3 text-sm">
                <p className="font-medium">{customer.display_name}</p>
                <p className="text-muted-foreground">
                  {customer.shipping_city ?? "City not set"}
                </p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
          <h3 className="text-base font-semibold">Recent merchants</h3>
          <div className="mt-3 space-y-2">
            {state.merchants.slice(0, 8).map((merchant) => (
              <div key={merchant.user_id} className="rounded-lg border border-border/60 p-3 text-sm">
                <p className="font-medium">{merchant.store_name}</p>
                <p className="text-muted-foreground">{merchant.business_email}</p>
                <p className="text-muted-foreground">{merchant.city ?? "City not set"}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
          <h3 className="text-base font-semibold">Recent admins</h3>
          <div className="mt-3 space-y-2">
            {state.admins.slice(0, 8).map((admin) => (
              <div key={admin.user_id} className="rounded-lg border border-border/60 p-3 text-sm">
                <p className="font-medium">{admin.display_name ?? "Admin user"}</p>
                <p className="text-muted-foreground">{admin.work_email}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
