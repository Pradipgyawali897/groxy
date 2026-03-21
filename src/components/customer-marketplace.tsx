"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { normalizeCloudinaryUrl, type BookRecord } from "@/lib/books";
import { useCart } from "@/components/use-cart";
import { Button } from "@/components/ui/button";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

type SortOption = "latest" | "price_asc" | "price_desc";

export function CustomerMarketplace({ books }: { books: BookRecord[] }) {
  const { addItem, count } = useCart();
  const [query, setQuery] = React.useState("");
  const [genre, setGenre] = React.useState("all");
  const [condition, setCondition] = React.useState("all");
  const [sort, setSort] = React.useState<SortOption>("latest");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const genres = React.useMemo(
    () => ["all", ...new Set(books.map((book) => book.genre))],
    [books]
  );
  const conditions = ["all", "new", "like_new", "good", "fair", "poor"];

  const filtered = React.useMemo(() => {
    let next = books.filter((book) => {
      const search = `${book.title} ${book.author} ${book.genre}`.toLowerCase();
      const matchesQuery = query ? search.includes(query.toLowerCase()) : true;
      const matchesGenre = genre === "all" ? true : book.genre === genre;
      const matchesCondition =
        condition === "all" ? true : book.book_condition === condition;
      return matchesQuery && matchesGenre && matchesCondition;
    });

    if (sort === "price_asc") {
      next = [...next].sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      next = [...next].sort((a, b) => b.price - a.price);
    } else {
      next = [...next].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return next;
  }, [books, condition, genre, query, sort]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, author, genre..."
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:col-span-2"
          />
          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {genres.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All genres" : option}
              </option>
            ))}
          </select>
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {conditions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All conditions" : option.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <option value="latest">Latest</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <p>{filtered.length} books found</p>
          <div className="flex items-center gap-2">
            <button
              className={`rounded-md px-2 py-1 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
            <button
              className={`rounded-md px-2 py-1 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
            <Link href="/customer/cart" className="rounded-md border border-border px-2 py-1 hover:bg-muted">
              Cart ({count})
            </Link>
          </div>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-4"
        }
      >
        {filtered.map((book) => (
          <article
            key={book.id}
            className={`overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm ${viewMode === "list" ? "flex flex-col md:flex-row" : ""}`}
          >
            <div className={viewMode === "list" ? "md:w-52" : ""}>
              <Image
                src={normalizeCloudinaryUrl(book.cover_image_url, viewMode === "list" ? 520 : 420)}
                alt={book.title}
                width={700}
                height={900}
                sizes={
                  viewMode === "list"
                    ? "(max-width: 768px) 100vw, 220px"
                    : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                }
                className={`w-full object-cover ${viewMode === "list" ? "h-full min-h-56" : "h-64"}`}
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {book.genre} • {book.book_condition.replace("_", " ")}
                </p>
                <h3 className="line-clamp-2 text-lg font-semibold">{book.title}</h3>
                <p className="text-sm text-muted-foreground">by {book.author}</p>
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {book.description}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold">{formatPrice(book.price)}</span>
                {book.original_price ? (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(book.original_price)}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/customer/books/${book.id}`}
                  className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
                >
                  Details
                </Link>
                <Button
                  size="sm"
                  onClick={() =>
                    addItem({
                      id: book.id,
                      title: book.title,
                      author: book.author,
                      price: book.price,
                      cover_image_url: book.cover_image_url,
                      seller_email: book.seller_email,
                    })
                  }
                >
                  Add to cart
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
