"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const wishlistState = {
  ids: null as Set<string> | null,
  promise: null as Promise<Set<string>> | null,
};

async function loadWishlistBookIds() {
  if (wishlistState.ids) {
    return new Set(wishlistState.ids);
  }

  if (!wishlistState.promise) {
    wishlistState.promise = fetch("/api/wishlist", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return new Set<string>();
        const json = (await res.json().catch(() => null)) as
          | { items?: Array<{ book_id?: string }> }
          | null;
        return new Set((json?.items ?? []).map((item) => item.book_id).filter(Boolean) as string[]);
      })
      .finally(() => {
        wishlistState.promise = null;
      });
  }

  const ids = await wishlistState.promise;
  wishlistState.ids = new Set(ids);
  return new Set(ids);
}

function syncWishlistState(bookId: string, saved: boolean) {
  if (!wishlistState.ids) {
    wishlistState.ids = new Set<string>();
  }

  if (saved) {
    wishlistState.ids.add(bookId);
  } else {
    wishlistState.ids.delete(bookId);
  }

  window.dispatchEvent(
    new CustomEvent("groxy-wishlist-updated", {
      detail: { bookId, saved },
    })
  );
}

export function WishlistButton({
  bookId,
  size = "icon-lg",
}: {
  bookId: string;
  size?: "icon" | "icon-lg";
}) {
  const [saved, setSaved] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    let active = true;

    void loadWishlistBookIds().then((ids) => {
      if (!active) return;
      setSaved(ids.has(bookId));
    });

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ bookId?: string; saved?: boolean }>).detail;
      if (!detail?.bookId) return;
      if (detail.bookId === bookId) {
        setSaved(Boolean(detail.saved));
      }
    };

    window.addEventListener("groxy-wishlist-updated", onUpdated as EventListener);
    return () => {
      active = false;
      window.removeEventListener("groxy-wishlist-updated", onUpdated as EventListener);
    };
  }, [bookId]);

  const onToggle = () => {
    startTransition(async () => {
      const nextSaved = !saved;
      const res = await fetch("/api/wishlist", {
        method: nextSaved ? "POST" : "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(
          res.status === 401
            ? "Sign in to save books."
            : json?.error ?? "Failed to update wishlist."
        );
        return;
      }

      setSaved(nextSaved);
      syncWishlistState(bookId, nextSaved);
      toast.success(nextSaved ? "Added to wishlist" : "Removed from wishlist");
    });
  };

  return (
    <Button
      variant={saved ? "default" : "outline"}
      size={size}
      className={cn("rounded-xl", saved && "border-primary bg-primary text-primary-foreground")}
      onClick={onToggle}
      disabled={pending}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
    >
      <Heart className={cn("size-4", saved && "fill-current")} />
    </Button>
  );
}
