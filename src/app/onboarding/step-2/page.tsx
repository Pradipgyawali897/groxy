import { redirect } from "next/navigation";

import { RoleSelectionForm } from "@/features/onboarding/onboarding-forms";
import { OnboardingShell } from "@/features/onboarding/onboarding-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath, getOnboardingPath } from "@/lib/roles";

export default async function OnboardingStep2Page() {
  const viewer = await getViewerContext();

  if (!viewer.user) {
    redirect(`${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.onboardingStep2)}`);
  }

  if (viewer.isOnboarded) {
    redirect(getAuthedPath(viewer));
  }

  if (viewer.onboardingStep < 2) {
    redirect(APP_ROUTES.onboardingStep1);
  }

  if (viewer.onboardingStep > 2) {
    redirect(getOnboardingPath(viewer.onboardingStep));
  }

  return (
    <OnboardingShell
      step={2}
      title="Choose your role"
      description="Decide whether this account is for shopping and reading or for running a bookstore workspace."
      asideTitle="Make the role choice clear and intentional."
      asideBody="Role assignment lives here, not inside sign-up, so the onboarding flow stays understandable and the route model stays easier to maintain."
    >
      <RoleSelectionForm currentRole={viewer.role} />
    </OnboardingShell>
  );
}
