import { redirect } from "next/navigation";

import { FinishOnboardingButton } from "@/features/onboarding/onboarding-forms";
import { OnboardingShell } from "@/features/onboarding/onboarding-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath, getRoleConfig } from "@/lib/roles";

export default async function OnboardingCompletePage() {
  const viewer = await getViewerContext();

  if (!viewer.user) {
    redirect(`${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.onboardingComplete)}`);
  }

  if (viewer.isOnboarded) {
    redirect(getAuthedPath(viewer));
  }

  if (viewer.onboardingStep < 4 || !viewer.role) {
    redirect(APP_ROUTES.onboardingStep3);
  }

  const config = getRoleConfig(viewer.role);

  return (
    <OnboardingShell
      step={4}
      title="You're ready to enter the app"
      description="Your account details are saved."
      asideTitle="Ready to continue."
      asideBody="Finish onboarding and open your workspace."
    >
    <div className="space-y-5 rounded-lg border border-border/70 bg-card/85 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Assigned workspace</p>
          <h3 className="font-heading text-3xl tracking-tight">{config.label}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{config.description}</p>
        </div>
        <div className="rounded-md border border-border/70 bg-background/75 p-4 text-sm">
          You will enter the {config.label.toLowerCase()} dashboard.
        </div>
        <FinishOnboardingButton />
      </div>
    </OnboardingShell>
  );
}
