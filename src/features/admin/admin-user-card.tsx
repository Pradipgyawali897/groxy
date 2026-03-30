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
    <article className="rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-medium">{profile.full_name ?? "Unnamed user"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.email} • {profile.is_onboarded ? "onboarded" : "onboarding"}
          </p>
        </div>
        <div className="grid min-w-[220px] gap-2">
          <Select value={role} onChange={(e) => setRole(e.target.value)} disabled={pending}>
            <option value="">unassigned</option>
            <option value="customer">customer</option>
            <option value="merchant">merchant</option>
            <option value="admin">admin</option>
          </Select>
          <Button onClick={onSave} disabled={pending} className="h-10 rounded-xl">
            {pending ? "Saving..." : "Save role"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>
    </article>
  );
}

