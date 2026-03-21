import { Image } from "@/components/ui/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { normalizeCloudinaryUrl } from "@/lib/books";
import { getBookHref } from "@/lib/catalog";
import type { CatalogBook } from "@/types/platform";

export function BookCard({
  book,
  compact = false,
}: {
  book: CatalogBook;
  compact?: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/90 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-40px_rgba(15,23,42,0.5)]">
      <Link href={getBookHref(book)} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <Image
            src={normalizeCloudinaryUrl(book.cover_image_url, 900)}
            alt={book.title}
            fill
            sizes={compact ? "(max-width: 768px) 50vw, 20vw" : "(max-width: 768px) 100vw, 25vw"}
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
      </Link>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{book.author}</p>
          <Link href={getBookHref(book)} className="block">
            <h3 className="line-clamp-2 font-heading text-2xl leading-tight tracking-tight text-foreground">
              {book.title}
            </h3>
          </Link>
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
          <Link
            href={getBookHref(book)}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            View details
          </Link>
          <Button variant="outline" size="icon-lg" className="rounded-xl">
            <Heart className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
