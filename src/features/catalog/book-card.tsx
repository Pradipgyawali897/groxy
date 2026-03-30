import { Star } from "lucide-react";

import { InteractiveLink } from "@/components/interactive-link";
import { ProgressiveBookCover } from "@/features/catalog/progressive-book-cover";
import { normalizeCloudinaryUrl } from "@/lib/books";
import { getBookHref } from "@/lib/catalog-shared";
import type { CatalogBook } from "@/types/platform";
import { WishlistButton } from "@/features/wishlist/wishlist-button";

export function BookCard({
  book,
  compact = false,
}: {
  book: CatalogBook;
  compact?: boolean;
}) {
  const href = getBookHref(book);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/90 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-40px_rgba(15,23,42,0.5)]">
      <InteractiveLink href={href} className="block" pendingClassName="scale-[0.995] opacity-90">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <ProgressiveBookCover
            src={normalizeCloudinaryUrl(book.cover_image_url, 900)}
            alt={book.title}
            fill
            sizes={compact ? "(max-width: 768px) 50vw, 20vw" : "(max-width: 768px) 100vw, 25vw"}
            loading="lazy"
            wrapperClassName="h-full w-full"
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
              {book.genre}
            </span>
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
              {book.stock > 0 ? "In stock" : "Sold out"}
            </span>
          </div>
        </div>
      </InteractiveLink>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{book.author}</p>
          <InteractiveLink href={href} className="block" pendingClassName="translate-x-0.5 opacity-85">
            <h3 className="line-clamp-2 font-heading text-2xl leading-tight tracking-tight text-foreground">
              {book.title}
            </h3>
          </InteractiveLink>
          {book.recommendation_reason ? (
            <p className="inline-flex rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
              {book.recommendation_reason}
            </p>
          ) : null}
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {book.description}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 rounded-full bg-amber-100/90 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <Star className="size-3.5 fill-current" />
              {book.rating_count > 0 ? book.average_rating.toFixed(1) : "New"}
            </span>
          </div>
          <div className="text-right">
            {book.original_price ? (
              <p className="text-xs text-muted-foreground line-through">
                ${Number(book.original_price).toFixed(2)}
              </p>
            ) : null}
            <p className="text-lg font-semibold text-foreground">
              ${Number(book.price).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InteractiveLink
            href={href}
            pendingClassName="scale-[0.985]"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            View details
          </InteractiveLink>
          <WishlistButton bookId={book.id} size="icon-lg" />
        </div>
      </div>
    </article>
  );
}
