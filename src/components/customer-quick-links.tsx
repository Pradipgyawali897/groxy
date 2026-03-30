"use client";

import * as React from "react";
import { Heart, ShoppingCart, Sparkles } from "lucide-react";

import { InteractiveLink } from "@/components/interactive-link";
import { APP_ROUTES } from "@/lib/roles";
import { cn } from "@/lib/utils";

type CountState = {
  wishlist: number;
  cart: number;
};

export function CustomerQuickLinks({
  className,
}: {
  className?: string;
}) {
  const [counts, setCounts] = React.useState<CountState>({ wishlist: 0, cart: 0 });

  React.useEffect(() => {
    let active = true;

    const loadCounts = async () => {
      const [wishlistRes, cartRes] = await Promise.all([
        fetch("/api/wishlist", { cache: "no-store" }).catch(() => null),
        fetch("/api/cart", { cache: "no-store" }).catch(() => null),
      ]);

      const wishlistJson =
        wishlistRes && wishlistRes.ok
          ? ((await wishlistRes.json().catch(() => null)) as { items?: unknown[] } | null)
          : null;
      const cartJson =
        cartRes && cartRes.ok
          ? ((await cartRes.json().catch(() => null)) as { summary?: { units_count?: number } } | null)
          : null;

      if (!active) return;

      setCounts({
        wishlist: wishlistJson?.items?.length ?? 0,
        cart: cartJson?.summary?.units_count ?? 0,
      });
    };

    void loadCounts();

    const refresh = () => {
      void loadCounts();
    };

    window.addEventListener("groxy-wishlist-updated", refresh);
    window.addEventListener("groxy-cart-updated", refresh);

    return () => {
      active = false;
      window.removeEventListener("groxy-wishlist-updated", refresh);
      window.removeEventListener("groxy-cart-updated", refresh);
    };
  }, []);

  const items = [
    {
      href: APP_ROUTES.customerRecommendations,
      label: "For you",
      count: null,
      icon: Sparkles,
    },
    {
      href: APP_ROUTES.customerWishlist,
      label: "Saved",
      count: counts.wishlist,
      icon: Heart,
    },
    {
      href: APP_ROUTES.customerCart,
      label: "Cart",
      count: counts.cart,
      icon: ShoppingCart,
    },
  ] as const;

  return (
    <div className={cn("hidden items-center gap-2 xl:flex", className)}>
      {items.map((item) => (
        <InteractiveLink
          key={item.href}
          href={item.href}
          className="inline-flex h-10 items-center gap-2 rounded-[1rem] border border-border/70 bg-background/70 px-3 text-sm text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground"
        >
          <item.icon className="size-4" />
          <span>{item.label}</span>
          {typeof item.count === "number" ? (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {item.count}
            </span>
          ) : null}
        </InteractiveLink>
      ))}
    </div>
  );
}
