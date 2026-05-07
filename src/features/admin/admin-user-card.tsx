"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ProfileRecord } from "@/types/platform";

export function AdminUserCard({ profile }: { profile: ProfileRecord }) {
  const router = useRouter();
  const [role, setRole] = React.useState<string>(profile.role ?? "");
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState("");

  const onSave = () => {
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${profile.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: role.length ? role : null }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to update user.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <article className="grid gap-3 border-b border-border px-4 py-4 last:border-b-0 lg:grid-cols-[1fr_140px_260px] lg:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium">{profile.full_name ?? "Unnamed user"}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{profile.email}</p>
      </div>
      <span className="text-sm text-muted-foreground">
        {profile.is_onboarded ? "Onboarded" : "Onboarding"}
      </span>
      <div className="grid gap-2 sm:grid-cols-[1fr_104px]">
        <Select value={role} onChange={(e) => setRole(e.target.value)} disabled={pending}>
          <option value="">unassigned</option>
          <option value="customer">customer</option>
          <option value="merchant">merchant</option>
          <option value="admin">admin</option>
        </Select>
        <Button onClick={onSave} disabled={pending} className="h-10 rounded-md">
          {pending ? "Saving" : "Save"}
        </Button>
        {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
      </div>
    </article>
  );
}
