import Link from "next/link";

import { ProgressiveBookCover } from "@/features/catalog/progressive-book-cover";
import { RemoveFromCartButton } from "@/features/cart/remove-from-cart-button";
import { CartQuantityControl } from "@/features/cart/cart-quantity-control";
import { EmptyPanel } from "@/features/dashboard/empty-panel";
import { SectionHeading } from "@/features/shared/section-heading";
import { normalizeCloudinaryUrl } from "@/lib/books";
import { getBookHref } from "@/lib/catalog-shared";
import { APP_ROUTES } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CustomerCartPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyPanel
        title="Sign in to use your cart"
        description="Your cart stays attached to your account so it follows you across devices."
        actionLabel="Sign in"
        actionHref={APP_ROUTES.signIn}
      />
    );
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart?.id) {
    return (
      <EmptyPanel
        title="Your cart is empty"
        description="Add books to your cart from the catalog and review them here before checkout."
        actionLabel="Browse books"
        actionHref={APP_ROUTES.customerBooks}
      />
    );
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id,quantity,unit_price,created_at,books(id,title,author,genre,price,original_price,stock,status,seller_email,cover_image_url,gallery_urls,is_featured,average_rating,rating_count,merchant_id,description,updated_at,created_at,language,book_condition)"
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <EmptyPanel
        title="Could not load cart"
        description={error.message}
        actionLabel="Browse books"
        actionHref={APP_ROUTES.customerBooks}
      />
    );
  }

  const items = (data ?? [])
    .map((row: any) => ({
      id: row.id as string,
      quantity: Number(row.quantity ?? 1),
      unitPrice: Number(row.unit_price ?? 0),
      book: row.books,
    }))
    .filter((item) => item.book);

  if (!items.length) {
    return (
      <EmptyPanel
        title="Your cart is empty"
        description="Add books to your cart from the catalog and review them here before checkout."
        actionLabel="Browse books"
        actionHref={APP_ROUTES.customerBooks}
      />
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Cart"
          title="Review your bag before checkout"
          description="Adjust quantities, keep saved books separate, and verify availability before you place the order."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => {
            const lineTotal = item.unitPrice * item.quantity;
            return (
              <article
                key={item.id}
                className="grid gap-4 rounded-[1.75rem] border border-border/70 bg-card/85 p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]"
              >
                <Link
                  href={getBookHref(item.book)}
                  className="relative block overflow-hidden rounded-[1.25rem] bg-muted"
                >
                  <ProgressiveBookCover
                    src={normalizeCloudinaryUrl(item.book.cover_image_url, 500)}
                    alt={item.book.title}
                    width={500}
                    height={640}
                    loading="lazy"
                    wrapperClassName="aspect-[4/5] w-full"
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-primary/75">{item.book.genre}</p>
                    <Link href={getBookHref(item.book)} className="font-heading text-2xl tracking-tight hover:text-primary">
                      {item.book.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.book.author}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-muted-foreground">
                      {item.book.stock > 0 ? `${item.book.stock} left in stock` : "Out of stock"}
                    </span>
                    <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-muted-foreground">
                      Unit ${item.unitPrice.toFixed(2)}
                    </span>
                  </div>

                  <CartQuantityControl
                    bookId={item.book.id}
                    quantity={item.quantity}
                    stock={item.book.stock}
                  />
                </div>

                <div className="flex flex-col items-end justify-between gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Line total</p>
                    <p className="text-xl font-semibold">${lineTotal.toFixed(2)}</p>
                  </div>
                  <RemoveFromCartButton bookId={item.book.id} />
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Summary</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Titles</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Units</span>
              <span className="font-medium">{totalUnits}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
            Checkout is the next surface to wire, but the cart logic, stock handling, and quantity updates are now live.
          </div>
          <Link
            href={APP_ROUTES.customerBooks}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted"
          >
            Keep browsing
          </Link>
        </aside>
      </div>
    </div>
  );
}
