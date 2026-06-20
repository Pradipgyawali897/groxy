import { ReviewStatusControls } from "@/features/admin/review-status-controls";
import { EmptyPanel } from "@/features/dashboard/empty-panel";
import { SectionHeading } from "@/features/shared/section-heading";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select("id,rating,title,body,status,created_at,user_id,book_id")
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    return (
      <EmptyPanel
        title="Could not load reviews"
        description={error.message}
      />
    );
  }

  const reviews = (data ?? []) as Array<{
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    status: "pending" | "published" | "hidden";
    created_at: string;
    user_id: string;
    book_id: string;
  }>;

  if (!reviews.length) {
    return (
      <EmptyPanel
        title="No review records yet"
        description="As customers submit reviews, moderation controls and publication status will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Moderation"
          title="Review queue"
          description="Review status, rating, author reference, and publication controls."
        />
      </section>
      <div className="grid gap-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Review</p>
                <h2 className="font-heading text-2xl tracking-tight">
                  {review.title || `Book ${review.book_id.slice(0, 8)}`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  User {review.user_id.slice(0, 8)} • {new Date(review.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
                  Rating: {review.rating}/5
                </span>
                <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
                  {review.status}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">{review.body || "No review body provided."}</p>

            <div className="mt-5">
              <ReviewStatusControls reviewId={review.id} currentStatus={review.status} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
