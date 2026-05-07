"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MerchantWorkspaceRecord } from "@/types/platform";

export function AdminMerchantCard({ merchant }: { merchant: MerchantWorkspaceRecord }) {
  const router = useRouter();
  const [approved, setApproved] = React.useState<boolean>(merchant.approved);
  const [supportEmail, setSupportEmail] = React.useState<string>(merchant.support_email ?? "");
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState("");

  const onSave = () => {
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/merchants/${merchant.user_id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          approved,
          support_email: supportEmail.length ? supportEmail : null,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to update merchant.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <article className="grid gap-3 border-b border-border px-4 py-4 last:border-b-0 xl:grid-cols-[1fr_120px_360px] xl:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium">{merchant.store_name}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">/{merchant.store_slug}</p>
      </div>
      <span className={approved ? "text-sm font-medium text-emerald-600" : "text-sm font-medium text-amber-600"}>
        {approved ? "Approved" : "Pending"}
      </span>
      <div className="grid gap-2 sm:grid-cols-[112px_1fr_84px]">
        <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <span>Approve</span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
            disabled={pending}
          />
        </label>
        <Input
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          placeholder="Support email"
          className="h-10 rounded-md px-3"
          disabled={pending}
        />
        <Button onClick={onSave} disabled={pending} className="h-10 rounded-md">
          {pending ? "Saving" : "Save"}
        </Button>
        {error ? <p className="text-sm text-destructive sm:col-span-3">{error}</p> : null}
      </div>
    </article>
  );
}
