import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, ShoppingBag, Sparkles, TrendingUp } from "lucide-react";

import { BookGrid } from "@/features/catalog/book-grid";
import { ProgressiveBookCover } from "@/features/catalog/progressive-book-cover";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { BookViewTracker } from "@/features/reco/book-view-tracker";
import { BookReviewsSection } from "@/features/reviews/book-reviews-section";
import { WishlistButton } from "@/features/wishlist/wishlist-button";
import { getPublishedBookBySlug, listPublishedBooks } from "@/lib/catalog";
import { normalizeCloudinaryUrl } from "@/lib/books";
import { getFrequentlyBoughtTogether } from "@/lib/reco/fbt";
import { slugify } from "@/lib/utils";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [book, allBooks] = await Promise.all([getPublishedBookBySlug(slug), listPublishedBooks(8)]);
  if (!book) {
    notFound();
  }
  const fbt = await getFrequentlyBoughtTogether(book.id, 4);
  const authorSlug = slugify(book.author);

  const related = allBooks.filter((candidate) => candidate.id !== book.id).slice(0, 4);
  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <BookViewTracker bookId={book.id} />
      <div className="flex items-center justify-between">
        <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">
          Back to catalog
        </Link>
        {authorSlug && (
          <Link href={`/authors/${authorSlug}`} className="text-sm text-muted-foreground hover:text-foreground">
            More from {book.author}
          </Link>
        )}
      </div>

      <section className="grid gap-8 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.22em] text-primary/75">{book.genre}</p>
            <h1 className="font-heading text-5xl tracking-tight">{book.title}</h1>
            <p className="text-lg text-muted-foreground">{book.author}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <TrendingUp className="size-3.5 text-primary" />
              Reader momentum
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Editorial shelf
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Clock3 className="size-3.5 text-primary" />
              Details first, image loads softly
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-semibold text-foreground">${Number(book.price).toFixed(2)}</p>
            {book.original_price ? (
              <p className="text-lg text-muted-foreground line-through">
                ${Number(book.original_price).toFixed(2)}
              </p>
            ) : null}
          </div>
          <p className="max-w-2xl text-sm leading-8 text-muted-foreground">{book.description}</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="text-sm text-muted-foreground">Availability</p>
              <p className="mt-2 font-medium">{book.stock > 0 ? `${book.stock} available` : "Out of stock"}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="text-sm text-muted-foreground">Language</p>
              <p className="mt-2 font-medium">English</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="text-sm text-muted-foreground">Seller</p>
              <p className="mt-2 font-medium">{book.seller_email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <AddToCartButton
              bookId={book.id}
              stock={book.stock}
              className="h-12 rounded-2xl px-6"
              label="Add to cart"
            />
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-2">
              <WishlistButton bookId={book.id} size="icon" />
              <span className="text-sm text-muted-foreground">Save</span>
            </div>
            <a
              href={`mailto:${book.seller_email}?subject=${encodeURIComponent(`Interested in ${book.title}`)}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-6 text-sm font-medium text-foreground hover:bg-muted"
            >
              Contact seller
            </a>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[1.75rem] bg-muted lg:sticky lg:top-28 lg:self-start">
          <ProgressiveBookCover
            src={normalizeCloudinaryUrl(book.cover_image_url, 1400)}
            alt={book.title}
            width={1400}
            height={1800}
            loading="lazy"
            wrapperClassName="h-full min-h-[420px] w-full"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {fbt.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-4xl tracking-tight">Frequently bought together</h2>
            <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">
              Explore all books
            </Link>
          </div>
          <BookGrid books={fbt} compact />
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-4xl tracking-tight">You may also like</h2>
            <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">
              Explore all books
            </Link>
          </div>
          <BookGrid books={related} compact />
        </section>
      ) : null}

      <BookReviewsSection bookId={book.id} />
    </main>
  );
}
