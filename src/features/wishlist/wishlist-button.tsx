"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function WishlistButton({
  bookId,
  size = "icon-lg",
}: {
  bookId: string;
  size?: "icon" | "icon-lg";
}) {
  const [pending, startTransition] = React.useTransition();

  const onAdd = () => {
    startTransition(async () => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(json?.error ?? "Failed to update wishlist.");
        return;
      }
      toast.success("Added to wishlist");
    });
  };

  return (
    <Button
      variant="outline"
      size={size}
      className="rounded-xl"
      onClick={onAdd}
      disabled={pending}
      aria-label="Add to wishlist"
    >
      <Heart className="size-4" />
    </Button>
  );
}

