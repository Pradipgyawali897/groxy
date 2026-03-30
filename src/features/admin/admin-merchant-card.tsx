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
    <article className="rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-2xl tracking-tight">{merchant.store_name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            /{merchant.store_slug} • {approved ? "approved" : "pending approval"}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {merchant.description ?? "No store description yet."}
          </p>
        </div>
        <div className="grid w-full gap-2 sm:max-w-[320px]">
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
            <span>Approved</span>
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
            placeholder="Support email (optional)"
            className="h-12 rounded-2xl px-4"
            disabled={pending}
          />
          <Button onClick={onSave} disabled={pending} className="h-10 rounded-xl">
            {pending ? "Saving..." : "Save"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>
    </article>
  );
}

