import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function syncBookReviewAggregate(bookId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select("rating")
    .eq("book_id", bookId)
    .eq("status", "published");

  if (error) throw error;

  const ratings = (data ?? []).map((row) => Number(row.rating ?? 0)).filter((rating) => rating > 0);
  const ratingCount = ratings.length;
  const averageRating = ratingCount
    ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratingCount).toFixed(2))
    : 0;

  const { error: updateError } = await admin
    .from("books")
    .update({
      average_rating: averageRating,
      rating_count: ratingCount,
    })
    .eq("id", bookId);

  if (updateError) throw updateError;
}

export async function listPublishedBookReviews(bookId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id,rating,title,body,created_at,user_id")
    .eq("book_id", bookId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) return [];

  const reviews = (data ?? []) as Array<{
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    created_at: string;
    user_id: string;
  }>;

  if (!reviews.length) return [];

  const userIds = [...new Set(reviews.map((review) => review.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,full_name,email")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((profile: any) => [
      profile.id,
      profile.full_name || profile.email || "Reader",
    ])
  );

  return reviews.map((review) => ({
    ...review,
    author_name: profileMap.get(review.user_id) ?? "Reader",
  }));
}
