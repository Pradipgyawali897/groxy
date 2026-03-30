import type { User } from "@supabase/supabase-js";

import { isAppRole } from "@/lib/roles";

type OnboardingProfileLike = {
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  is_onboarded?: boolean | null;
  onboarding_step?: number | null;
};

function normalizedText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function getEmailLocalPart(user: User | null | undefined) {
  return normalizedText(user?.email?.split("@")[0] ?? "");
}

function hasOAuthProvider(user: User | null | undefined) {
  const provider = normalizedText((user?.app_metadata?.provider as string | undefined) ?? "");
  if (provider && provider !== "email") return true;

  const providers = Array.isArray(user?.app_metadata?.providers)
    ? (user?.app_metadata?.providers as string[])
    : [];

  return providers.some((item) => normalizedText(item) && normalizedText(item) !== "email");
}

function hasRichAuthIdentity(user: User | null | undefined) {
  const metadata = user?.user_metadata ?? {};
  const fullName = normalizedText((metadata.full_name as string | undefined) ?? "");
  const name = normalizedText((metadata.name as string | undefined) ?? "");
  const avatar =
    normalizedText((metadata.avatar_url as string | undefined) ?? "") ||
    normalizedText((metadata.picture as string | undefined) ?? "") ||
    normalizedText((metadata.avatar as string | undefined) ?? "");

  return Boolean(fullName || name || avatar);
}

function hasCompletedBasicProfile(user: User | null | undefined, profile: OnboardingProfileLike | null | undefined) {
  if (!profile) return false;

  const profileName = normalizedText(profile.full_name);
  const emailLocal = getEmailLocalPart(user);
  const hasMeaningfulName = Boolean(profileName) && profileName !== emailLocal;
  const hasAvatar = Boolean(normalizedText(profile.avatar_url));

  return hasMeaningfulName || hasAvatar || hasOAuthProvider(user) || hasRichAuthIdentity(user);
}

export function getEffectiveOnboardingStep({
  user,
  profile,
}: {
  user: User | null | undefined;
  profile: OnboardingProfileLike | null | undefined;
}) {
  if (profile?.is_onboarded) {
    return 4;
  }

  let step = profile?.onboarding_step ?? 1;

  if (step <= 1 && hasCompletedBasicProfile(user, profile)) {
    step = 2;
  }

  if (step <= 2 && isAppRole(profile?.role)) {
    step = 3;
  }

  return Math.max(1, Math.min(step, 4));
}
