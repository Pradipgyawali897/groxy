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
      description="Use this account as a buyer or a seller."
      asideTitle="Choose your path."
      asideBody="You can shop for books or run a bookstore workspace."
    >
      <RoleSelectionForm currentRole={viewer.role} />
    </OnboardingShell>
  );
}
