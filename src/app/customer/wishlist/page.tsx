import Link from "next/link";

import { EmptyPanel } from "@/features/dashboard/empty-panel";
import { SectionHeading } from "@/features/shared/section-heading";
import { getBookHref } from "@/lib/catalog-shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/lib/roles";
import { RemoveFromWishlistButton } from "@/features/wishlist/remove-from-wishlist-button";

export default async function CustomerWishlistPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyPanel
        title="Sign in to use your wishlist"
        description="Wishlist is tied to your account so it stays consistent across devices."
        actionLabel="Sign in"
        actionHref={APP_ROUTES.signIn}
      />
    );
  }

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wishlist?.id) {
    return (
      <EmptyPanel
        title="No wishlist items yet"
        description="Save books to your wishlist and we’ll use them to tune your recommendations."
        actionLabel="Browse books"
        actionHref={APP_ROUTES.customerBooks}
      />
    );
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id,created_at,books(id,title,author,genre,price,original_price,stock,status,seller_email,cover_image_url,gallery_urls,is_featured,average_rating,rating_count,merchant_id,description,updated_at,created_at,language,book_condition)")
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <EmptyPanel
        title="Could not load wishlist"
        description={error.message}
        actionLabel="Try browsing"
        actionHref={APP_ROUTES.customerBooks}
      />
    );
  }

  const books = (data ?? []).map((row: any) => row.books).filter(Boolean);
  if (!books.length) {
    return (
      <EmptyPanel
        title="No wishlist items yet"
        description="Save books to your wishlist and we’ll use them to tune your recommendations."
        actionLabel="Browse books"
        actionHref={APP_ROUTES.customerBooks}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Saved"
          title="Your wishlist"
          description="Saved books also act as a strong signal for recommendations."
        />
      </section>
      <div className="grid gap-3">
        {books.map((book: any) => (
          <article
            key={book.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm"
          >
            <div className="min-w-0">
              <p className="font-heading text-2xl tracking-tight">{book.title}</p>
              <p className="text-sm text-muted-foreground">
                {book.author} • {book.genre}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">${Number(book.price).toFixed(2)}</span>
              <Link href={getBookHref(book)} className="text-primary hover:underline">
                View
              </Link>
              <RemoveFromWishlistButton bookId={book.id} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
