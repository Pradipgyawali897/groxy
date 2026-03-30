import { redirect } from "next/navigation";

import {
  CustomerPreferencesForm,
  MerchantSetupForm,
} from "@/features/onboarding/onboarding-forms";
import { OnboardingShell } from "@/features/onboarding/onboarding-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function OnboardingStep3Page() {
  const viewer = await getViewerContext();

  if (!viewer.user) {
    redirect(`${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.onboardingStep3)}`);
  }

  if (viewer.isOnboarded) {
    redirect(getAuthedPath(viewer));
  }

  if (viewer.onboardingStep < 3) {
    redirect(APP_ROUTES.onboardingStep2);
  }

  const supabase = await createSupabaseServerClient();

  if (viewer.role === "customer") {
    const { data: preferences } = await supabase
      .from("customer_preferences")
      .select("favorite_genres,reading_interests,newsletter_opt_in")
      .eq("user_id", viewer.user.id)
      .maybeSingle();

    return (
      <OnboardingShell
        step={3}
        title="Tell us how you like to read"
        description="These preferences shape recommendations, newsletters, and the overall customer experience."
        asideTitle="Make the storefront feel personal from day one."
        asideBody="Preferences let the catalog, wishlist prompts, and review surfaces feel more relevant without adding friction."
      >
        <CustomerPreferencesForm
          initialGenres={preferences?.favorite_genres ?? []}
          initialInterests={preferences?.reading_interests ?? []}
          initialNewsletter={Boolean(preferences?.newsletter_opt_in)}
        />
      </OnboardingShell>
    );
  }

  const { data: workspace } = await supabase
    .from("merchant_workspaces")
    .select("store_name,store_slug,description,logo_url,banner_url")
    .eq("user_id", viewer.user.id)
    .maybeSingle();

  return (
    <OnboardingShell
      step={3}
      title="Create your bookstore workspace"
      description="Set the identity customers will see when they browse and buy from your store."
      asideTitle="Build a premium store, not just a seller record."
      asideBody="Store name, slug, description, and media are captured here so merchant onboarding turns into a usable workspace immediately after completion."
    >
      <MerchantSetupForm
        initialName={workspace?.store_name}
        initialSlug={workspace?.store_slug}
        initialDescription={workspace?.description}
        initialLogo={workspace?.logo_url}
        initialBanner={workspace?.banner_url}
      />
    </OnboardingShell>
  );
}
