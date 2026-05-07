"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  bookId,
  stock,
  size = "default",
  className,
}: {
  bookId: string;
  stock: number;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}) {
  const [pending, startTransition] = React.useTransition();

  const onAdd = () => {
    startTransition(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ book_id: bookId, quantity: 1 }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(res.status === 401 ? "Sign in to add to cart." : json?.error ?? "Failed to add.");
        return;
      }

      window.dispatchEvent(new CustomEvent("groxy-cart-updated"));
      toast.success("Added to collection.");
    });
  };

  const isSoldOut = stock < 1;

  return (
    <Button
      className={cn("gap-2", className)}
      onClick={onAdd}
      disabled={pending || isSoldOut}
      variant={isSoldOut ? "ghost" : "default"}
      size={size}
    >
      <ShoppingBag className="size-4" />
      {isSoldOut ? "Unavailable" : pending ? "Adding..." : "Add to collection"}
    </Button>
  );
}
