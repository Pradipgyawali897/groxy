"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function RemoveFromWishlistButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const onRemove = () => {
    startTransition(async () => {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(json?.error ?? "Failed to remove from wishlist.");
        return;
      }
      toast.success("Removed from wishlist");
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-xl"
      onClick={onRemove}
      disabled={pending}
      aria-label="Remove from wishlist"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

