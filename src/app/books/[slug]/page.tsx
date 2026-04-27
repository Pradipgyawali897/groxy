import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, Sparkles, TrendingUp, Star, Globe2, ShieldCheck, Mail, Package } from "lucide-react";

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
  const hasRatings = book.rating_count > 0;
  const mediaGallery = Array.from(
    new Set([book.cover_image_url, ...(book.gallery_urls ?? [])].filter(Boolean))
  );

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

      <section className="grid gap-8 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-sm uppercase tracking-[0.22em] text-primary/75">
                {book.genre}
              </p>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Clock3 className="size-3.5 text-primary" />
                Fast-moving shelf
              </span>
            </div>
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
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-end gap-3">
              <p className="text-3xl font-semibold text-foreground">${Number(book.price).toFixed(2)}</p>
              {book.original_price ? (
                <p className="text-lg text-muted-foreground line-through">
                  ${Number(book.original_price).toFixed(2)}
                </p>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100/90 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <Star className="size-4 fill-current" />
              {hasRatings ? `${book.average_rating.toFixed(1)} from ${book.rating_count} reviews` : "Fresh listing"}
            </span>
          </div>

          <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">About this book</p>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-muted-foreground">{book.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="size-4 text-primary" />
                Availability
              </p>
              <p className="mt-2 font-medium">{book.stock > 0 ? `${book.stock} available` : "Out of stock"}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Globe2 className="size-4 text-primary" />
                Language
              </p>
              <p className="mt-2 font-medium">{book.language}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                Condition
              </p>
              <p className="mt-2 font-medium">{book.book_condition.replaceAll("_", " ")}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 text-primary" />
                Seller
              </p>
              <p className="mt-2 truncate font-medium">{book.seller_email}</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Why it fits the shelf</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
                <p className="text-sm font-medium">Reader relevance</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This title is positioned for discovery surfaces, saved shelves, and repeat browsing behavior.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
                <p className="text-sm font-medium">Quality signals</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Ratings, editorial placement, and stock health shape where this book appears next.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
                <p className="text-sm font-medium">Easy follow-up</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Save it, add it to cart, or contact the seller directly from the purchase panel.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-muted shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
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
          {mediaGallery.length > 1 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Gallery</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    More angles from this listing.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {mediaGallery.length - 1} extra image{mediaGallery.length === 2 ? "" : "s"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {mediaGallery.slice(1, 7).map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="relative overflow-hidden rounded-[1.15rem] border border-border/70 bg-muted"
                  >
                    <ProgressiveBookCover
                      src={normalizeCloudinaryUrl(imageUrl, 700)}
                      alt={`${book.title} gallery image ${index + 1}`}
                      width={700}
                      height={900}
                      loading="lazy"
                      wrapperClassName="aspect-[4/5] w-full"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Purchase panel</p>
                <p className="mt-2 text-3xl font-semibold">${Number(book.price).toFixed(2)}</p>
              </div>
              {book.original_price ? (
                <p className="text-sm text-muted-foreground line-through">
                  ${Number(book.original_price).toFixed(2)}
                </p>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              <AddToCartButton
                bookId={book.id}
                stock={book.stock}
                className="h-12 w-full rounded-2xl px-6"
                label="Add to cart"
              />
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3">
                <WishlistButton bookId={book.id} size="icon" />
                <div>
                  <p className="text-sm font-medium">Save for later</p>
                  <p className="text-xs text-muted-foreground">Keep it on your shelf for recommendations.</p>
                </div>
              </div>
              <a
                href={`mailto:${book.seller_email}?subject=${encodeURIComponent(`Interested in ${book.title}`)}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-border px-6 text-sm font-medium text-foreground hover:bg-muted"
              >
                Contact seller
              </a>
            </div>

            <div className="mt-5 space-y-3 rounded-[1.25rem] border border-border/70 bg-card/85 p-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Genre</span>
                <span className="font-medium text-foreground">{book.genre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Condition</span>
                <span className="font-medium capitalize text-foreground">{book.book_condition.replaceAll("_", " ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Language</span>
                <span className="font-medium text-foreground">{book.language}</span>
              </div>
            </div>
          </div>
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
