"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonSize = "default" | "lg" | "icon" | "icon-lg";

export function AddToCartButton({
  bookId,
  stock,
  quantity = 1,
  size = "default",
  className,
  label,
}: {
  bookId: string;
  stock: number;
  quantity?: number;
  size?: ButtonSize;
  className?: string;
  label?: string;
}) {
  const [pending, startTransition] = React.useTransition();

  const onAdd = () => {
    startTransition(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ book_id: bookId, quantity }),
      });

      const json = (await res.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!res.ok) {
        toast.error(
          res.status === 401
            ? "Sign in to use your cart."
            : json?.error ?? "Failed to update cart."
        );
        return;
      }

      window.dispatchEvent(new CustomEvent("groxy-cart-updated"));
      toast.success(json?.message ?? "Added to cart.");
    });
  };

  return (
    <Button
      className={cn(className)}
      onClick={onAdd}
      disabled={pending || stock < 1}
      aria-label={label ?? "Add to cart"}
      size={size}
    >
      <ShoppingBag className="size-4" />
      {stock < 1 ? "Sold out" : pending ? "Adding..." : label ?? "Add to cart"}
    </Button>
  );
}
