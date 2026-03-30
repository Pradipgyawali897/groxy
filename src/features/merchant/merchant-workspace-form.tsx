"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function slugifyStoreName(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function MerchantWorkspaceForm({
  initialName = "",
  initialSlug = "",
  initialDescription = "",
  initialLogo = "",
  initialBanner = "",
}: {
  initialName?: string | null;
  initialSlug?: string | null;
  initialDescription?: string | null;
  initialLogo?: string | null;
  initialBanner?: string | null;
}) {
  const [storeName, setStoreName] = React.useState(initialName ?? "");
  const [storeSlug, setStoreSlug] = React.useState(initialSlug ?? "");
  const [description, setDescription] = React.useState(initialDescription ?? "");
  const [logoUrl, setLogoUrl] = React.useState(initialLogo ?? "");
  const [bannerUrl, setBannerUrl] = React.useState(initialBanner ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initialSlug ?? ""));
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (slugTouched) return;
    setStoreSlug(slugifyStoreName(storeName));
  }, [storeName, slugTouched]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const res = await fetch("/api/merchant/workspace", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          store_name: normalizeText(storeName),
          store_slug: slugifyStoreName(storeSlug),
          description: normalizeText(description),
          logo_url: logoUrl.trim(),
          banner_url: bannerUrl.trim(),
        }),
      });

      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        toast.error(json?.error ?? "Could not update store settings.");
        return;
      }

      toast.success("Store settings saved.");
    });
  };

  return (
    <form className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-sm" onSubmit={onSubmit}>
      <Input
        value={storeName}
        onChange={(event) => setStoreName(event.target.value)}
        placeholder="Store name"
        className="h-12 rounded-2xl px-4"
      />
      <Input
        value={storeSlug}
        onChange={(event) => {
          setSlugTouched(true);
          setStoreSlug(event.target.value.toLowerCase());
        }}
        placeholder="store-slug"
        className="h-12 rounded-2xl px-4"
      />
      <Textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="A premium introduction for your bookstore."
        className="min-h-32 rounded-2xl"
      />
      <Input
        value={logoUrl}
        onChange={(event) => setLogoUrl(event.target.value)}
        placeholder="Logo image URL"
        className="h-12 rounded-2xl px-4"
      />
      <Input
        value={bannerUrl}
        onChange={(event) => setBannerUrl(event.target.value)}
        placeholder="Banner image URL"
        className="h-12 rounded-2xl px-4"
      />
      <Button type="submit" className="h-11 rounded-xl" disabled={pending}>
        {pending ? "Saving..." : "Save store settings"}
      </Button>
    </form>
  );
}
