import { redirect } from "next/navigation";

import { BasicProfileForm } from "@/features/onboarding/onboarding-forms";
import { OnboardingShell } from "@/features/onboarding/onboarding-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath, getOnboardingPath } from "@/lib/roles";

export default async function OnboardingStep1Page() {
  const viewer = await getViewerContext();

  if (!viewer.user) {
    redirect(`${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.onboardingStep1)}`);
  }

  if (viewer.isOnboarded) {
    redirect(getAuthedPath(viewer));
  }

  if (viewer.onboardingStep > 1) {
    redirect(getOnboardingPath(viewer.onboardingStep));
  }

  return (
    <OnboardingShell
      step={1}
      title="Set up your profile"
      description="Add the basic identity details that should follow you across the platform."
      asideTitle="Start with the person, not the role."
      asideBody="Authentication creates the account. Onboarding now collects the information needed to route you properly and keep future access logic stable."
    >
      <BasicProfileForm
        defaultName={viewer.profile?.full_name}
        defaultAvatar={viewer.profile?.avatar_url}
      />
    </OnboardingShell>
  );
}
