"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CartQuantityControl({
  bookId,
  quantity,
  stock,
}: {
  bookId: string;
  quantity: number;
  stock: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const updateQuantity = (nextQuantity: number) => {
    startTransition(async () => {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ book_id: bookId, quantity: nextQuantity }),
      });

      const json = (await res.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!res.ok) {
        toast.error(json?.error ?? "Failed to update cart.");
        return;
      }

      window.dispatchEvent(new CustomEvent("groxy-cart-updated"));
      router.refresh();
    });
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 p-1">
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-lg"
        disabled={pending || quantity <= 1}
        onClick={() => updateQuantity(quantity - 1)}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </Button>
      <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-lg"
        disabled={pending || quantity >= stock}
        onClick={() => updateQuantity(quantity + 1)}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
