"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ReviewStatusControls({
  reviewId,
  currentStatus,
}: {
  reviewId: string;
  currentStatus: "pending" | "published" | "hidden";
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const updateStatus = (status: "pending" | "published" | "hidden") => {
    if (status === currentStatus) return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(json?.error ?? "Could not update review.");
        return;
      }

      toast.success(`Review marked ${status}.`);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {(["pending", "published", "hidden"] as const).map((status) => (
        <Button
          key={status}
          variant={status === currentStatus ? "default" : "outline"}
          size="sm"
          className="rounded-xl"
          disabled={pending}
          onClick={() => updateStatus(status)}
        >
          {status}
        </Button>
      ))}
    </div>
  );
}
