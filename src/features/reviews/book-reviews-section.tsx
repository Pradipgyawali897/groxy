import { Star } from "lucide-react";

import { ReviewComposer } from "@/features/reviews/review-composer";
import { SectionHeading } from "@/features/shared/section-heading";
import { listPublishedBookReviews } from "@/lib/reviews";

export async function BookReviewsSection({ bookId }: { bookId: string }) {
  const reviews = await listPublishedBookReviews(bookId);

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Reviews"
        title="Reader feedback"
        description="Moderated reviews help future readers decide faster and give the recommendation engine better quality signals."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {reviews.length ? (
            reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{review.author_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <Star className="size-3.5 fill-current" />
                    <span className="text-sm font-medium">{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                {review.title ? (
                  <h3 className="mt-4 font-heading text-2xl tracking-tight">{review.title}</h3>
                ) : null}
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{review.body}</p>
              </article>
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
              No published reviews yet. The first thoughtful review can shape how this book is discovered.
            </div>
          )}
        </div>

        <ReviewComposer bookId={bookId} />
      </div>
    </section>
  );
}
