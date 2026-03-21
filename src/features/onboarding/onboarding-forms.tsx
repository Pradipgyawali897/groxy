"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  basicProfileSchema,
  customerPreferencesSchema,
  merchantSetupSchema,
  roleSelectionSchema,
} from "@/lib/onboarding";
import { APP_ROUTES } from "@/lib/roles";
import { cn } from "@/lib/utils";

type MutationState = {
  loading: boolean;
  error: string;
};

async function submitOnboarding(payload: unknown) {
  const res = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return { res, json };
}

function splitValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function BasicProfileForm({
  defaultName,
  defaultAvatar,
}: {
  defaultName?: string | null;
  defaultAvatar?: string | null;
}) {
  const router = useRouter();
  const [state, setState] = React.useState<MutationState>({ loading: false, error: "" });
  const [fullName, setFullName] = React.useState(defaultName ?? "");
  const [avatarUrl, setAvatarUrl] = React.useState(defaultAvatar ?? "");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = basicProfileSchema.safeParse({
      full_name: fullName,
      avatar_url: avatarUrl,
    });

    if (!parsed.success) {
      setState({ loading: false, error: parsed.error.issues[0]?.message ?? "Invalid profile details." });
      return;
    }

    setState({ loading: true, error: "" });
    const { res, json } = await submitOnboarding({ step: "basic", data: parsed.data });
    if (!res.ok) {
      setState({ loading: false, error: json.error ?? "Unable to save profile." });
      return;
    }
    router.push(json.next ?? APP_ROUTES.onboardingStep2);
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Full name"
        className="h-12 rounded-2xl px-4"
      />
      <Input
        value={avatarUrl}
        onChange={(event) => setAvatarUrl(event.target.value)}
        placeholder="Avatar image URL"
        className="h-12 rounded-2xl px-4"
      />
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={state.loading}>
        {state.loading ? "Saving profile..." : "Continue to role selection"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

export function RoleSelectionForm({ currentRole }: { currentRole?: string | null }) {
  const router = useRouter();
  const [state, setState] = React.useState<MutationState>({ loading: false, error: "" });
  const [selectedRole, setSelectedRole] = React.useState<"customer" | "merchant">(
    currentRole === "merchant" ? "merchant" : "customer"
  );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = roleSelectionSchema.safeParse({ role: selectedRole });
    if (!parsed.success) {
      setState({ loading: false, error: "Choose a role to continue." });
      return;
    }
    setState({ loading: true, error: "" });
    const { res, json } = await submitOnboarding({ step: "role", data: parsed.data });
    if (!res.ok) {
      setState({ loading: false, error: json.error ?? "Unable to save role." });
      return;
    }
    router.push(json.next ?? APP_ROUTES.onboardingStep3);
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            role: "customer" as const,
            title: "Customer",
            body: "Browse, save, review, and build a personal reading profile.",
          },
          {
            role: "merchant" as const,
            title: "Merchant",
            body: "Create a bookstore identity and start selling books with structured tools.",
          },
        ].map((option) => (
          <button
            key={option.role}
            type="button"
            onClick={() => setSelectedRole(option.role)}
            className={cn(
              "rounded-[1.5rem] border p-5 text-left transition",
              selectedRole === option.role
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-background hover:border-primary/30 hover:bg-muted/40"
            )}
          >
            <p className="font-heading text-2xl tracking-tight">{option.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.body}</p>
          </button>
        ))}
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={state.loading}>
        {state.loading ? "Saving role..." : "Continue to setup"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

export function CustomerPreferencesForm({
  initialGenres = [],
  initialInterests = [],
  initialNewsletter = false,
}: {
  initialGenres?: string[];
  initialInterests?: string[];
  initialNewsletter?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = React.useState<MutationState>({ loading: false, error: "" });
  const [genres, setGenres] = React.useState(initialGenres.join(", "));
  const [interests, setInterests] = React.useState(initialInterests.join(", "));
  const [newsletter, setNewsletter] = React.useState(initialNewsletter);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = customerPreferencesSchema.safeParse({
      favorite_genres: splitValues(genres),
      reading_interests: splitValues(interests),
      newsletter_opt_in: newsletter,
    });
    if (!parsed.success) {
      setState({ loading: false, error: parsed.error.issues[0]?.message ?? "Invalid preferences." });
      return;
    }

    setState({ loading: true, error: "" });
    const { res, json } = await submitOnboarding({ step: "customer", data: parsed.data });
    if (!res.ok) {
      setState({ loading: false, error: json.error ?? "Unable to save preferences." });
      return;
    }
    router.push(json.next ?? APP_ROUTES.onboardingComplete);
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        value={genres}
        onChange={(event) => setGenres(event.target.value)}
        placeholder="Fantasy, Literary Fiction, Business"
        className="h-12 rounded-2xl px-4"
      />
      <Input
        value={interests}
        onChange={(event) => setInterests(event.target.value)}
        placeholder="Mindful reading, book clubs, new releases"
        className="h-12 rounded-2xl px-4"
      />
      <label className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm">
        <input
          type="checkbox"
          checked={newsletter}
          onChange={(event) => setNewsletter(event.target.checked)}
          className="size-4 rounded border-border"
        />
        <span>Send curated reading notes and launch updates to my inbox.</span>
      </label>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={state.loading}>
        {state.loading ? "Saving preferences..." : "Review and finish"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

export function MerchantSetupForm({
  initialName,
  initialSlug,
  initialDescription,
  initialLogo,
  initialBanner,
}: {
  initialName?: string | null;
  initialSlug?: string | null;
  initialDescription?: string | null;
  initialLogo?: string | null;
  initialBanner?: string | null;
}) {
  const router = useRouter();
  const [state, setState] = React.useState<MutationState>({ loading: false, error: "" });
  const [storeName, setStoreName] = React.useState(initialName ?? "");
  const [storeSlug, setStoreSlug] = React.useState(initialSlug ?? "");
  const [description, setDescription] = React.useState(initialDescription ?? "");
  const [logoUrl, setLogoUrl] = React.useState(initialLogo ?? "");
  const [bannerUrl, setBannerUrl] = React.useState(initialBanner ?? "");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = merchantSetupSchema.safeParse({
      store_name: storeName,
      store_slug: storeSlug,
      description,
      logo_url: logoUrl,
      banner_url: bannerUrl,
    });

    if (!parsed.success) {
      setState({ loading: false, error: parsed.error.issues[0]?.message ?? "Invalid store details." });
      return;
    }

    setState({ loading: true, error: "" });
    const { res, json } = await submitOnboarding({ step: "merchant", data: parsed.data });
    if (!res.ok) {
      setState({ loading: false, error: json.error ?? "Unable to save store setup." });
      return;
    }
    router.push(json.next ?? APP_ROUTES.onboardingComplete);
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        value={storeName}
        onChange={(event) => setStoreName(event.target.value)}
        placeholder="Store name"
        className="h-12 rounded-2xl px-4"
      />
      <Input
        value={storeSlug}
        onChange={(event) => setStoreSlug(event.target.value.toLowerCase())}
        placeholder="store-slug"
        className="h-12 rounded-2xl px-4"
      />
      <Textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Write a short, premium introduction for your bookstore."
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
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={state.loading}>
        {state.loading ? "Saving store..." : "Review and finish"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

export function FinishOnboardingButton() {
  const router = useRouter();
  const [state, setState] = React.useState<MutationState>({ loading: false, error: "" });

  const onComplete = async () => {
    setState({ loading: true, error: "" });
    const { res, json } = await submitOnboarding({ step: "complete", data: {} });
    if (!res.ok) {
      setState({ loading: false, error: json.error ?? "Unable to complete onboarding." });
      return;
    }
    router.push(json.next ?? APP_ROUTES.customerHome);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button onClick={onComplete} className="h-12 w-full rounded-2xl" disabled={state.loading}>
        {state.loading ? "Preparing your workspace..." : "Enter my dashboard"}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
