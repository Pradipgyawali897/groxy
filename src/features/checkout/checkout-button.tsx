"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCommerceStore } from "@/stores/commerce-store";

export function CheckoutButton({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const pending = useCommerceStore((state) => state.checkoutSlice.pending);
  const beginCheckout = useCommerceStore((state) => state.beginCheckout);
  const finishCheckout = useCommerceStore((state) => state.finishCheckout);
  const failCheckout = useCommerceStore((state) => state.failCheckout);

  const onCheckout = () => {
    const idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const abortController = beginCheckout(idempotencyKey);

    React.startTransition(async () => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idempotency_key: idempotencyKey }),
        signal: abortController.signal,
      }).catch((error: Error) => {
        if (error.name === "AbortError") return null;
        throw error;
      });

      if (!res) return;

      const json = (await res.json().catch(() => null)) as
        | { error?: string; checkout?: { orderId: string; total: number } }
        | null;

      if (!res.ok || !json?.checkout) {
        const message = json?.error ?? "Checkout failed.";
        failCheckout(message);
        toast.error(message);
        router.refresh();
        return;
      }

      finishCheckout(json.checkout.orderId);
      toast.success("Order placed. Reservation converted to sale.");
      router.refresh();
    });
  };

  return (
    <Button
      className="h-11 w-full rounded-xl"
      onClick={onCheckout}
      disabled={disabled || pending}
    >
      <LockKeyhole className="size-4" />
      {pending ? "Verifying reservation..." : "Checkout reserved books"}
    </Button>
  );
}
