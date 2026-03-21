"use client";

import { Image } from "@/components/ui/image";
import Link from "next/link";

import { useCart } from "@/components/use-cart";
import { normalizeCloudinaryUrl } from "@/lib/books";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function CartView() {
  const { items, subtotal, removeItem, updateQty, clear } = useCart();

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/70 p-8 text-center">
        <p className="text-lg font-medium">Your cart is empty.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse books and add the ones you want to purchase.
        </p>
        <Link
          href="/customer"
          className="mt-4 inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
        >
          Go to customer app
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 sm:flex-row"
          >
            <Image
              src={normalizeCloudinaryUrl(item.cover_image_url, 240)}
              alt={item.title}
              width={160}
              height={200}
              className="h-40 w-full rounded-lg object-cover sm:w-28"
            />
            <div className="flex flex-1 flex-col gap-2">
              <div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.author}</p>
                <p className="text-xs text-muted-foreground">
                  Seller: {item.seller_email}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-muted-foreground">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(event) => updateQty(item.id, Number(event.target.value))}
                  className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm outline-none"
                />
              </div>
              <div className="mt-auto flex items-center justify-between">
                <p className="text-base font-semibold">
                  {formatPrice(item.price * item.qty)}
                </p>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          This is a generic preview cart. You can plug Stripe/PayPal checkout next.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground">
            Proceed to checkout
          </button>
          <button
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
            onClick={clear}
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
