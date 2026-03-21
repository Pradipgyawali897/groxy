import "server-only";

import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAppRole, type AppRole } from "@/lib/roles";
import type { ProfileRecord } from "@/types/platform";

type ViewerContext = {
  user: User | null;
  profile: ProfileRecord | null;
  role: AppRole | null;
  isOnboarded: boolean;
  onboardingStep: number;
};

function getFallbackName(user: User) {
  return (
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Reader"
  );
}

export async function ensureProfileRecord(user: User) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: user.user_metadata?.full_name ?? getFallbackName(user),
      avatar_url: user.user_metadata?.avatar_url ?? null,
    },
    { onConflict: "id" }
  );
}

export async function getViewerContext(): Promise<ViewerContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      role: null,
      isOnboarded: false,
      onboardingStep: 1,
    };
  }

  await ensureProfileRecord(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,full_name,avatar_url,role,is_onboarded,onboarding_step,created_at,updated_at")
    .eq("id", user.id)
    .maybeSingle();

  const normalizedProfile = profile
    ? {
        ...profile,
        role: isAppRole(profile.role) ? profile.role : null,
        is_onboarded: Boolean(profile.is_onboarded),
        onboarding_step: profile.onboarding_step ?? 1,
      }
    : null;

  return {
    user,
    profile: normalizedProfile,
    role: normalizedProfile?.role ?? null,
    isOnboarded: Boolean(normalizedProfile?.is_onboarded),
    onboardingStep: normalizedProfile?.onboarding_step ?? 1,
  };
}
