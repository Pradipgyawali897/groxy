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
      description="Your profile, role, and workspace details are saved. Finalize onboarding and move into the correct dashboard."
      asideTitle="A better finish than a redirect surprise."
      asideBody="The final step confirms what was created and gives the user a clear, intentional handoff into their actual workspace."
    >
      <div className="space-y-5 rounded-[1.75rem] border border-border/70 bg-card/85 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Assigned workspace</p>
          <h3 className="font-heading text-3xl tracking-tight">{config.label}</h3>
          <p className="text-sm leading-7 text-muted-foreground">{config.description}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 p-4 text-sm">
          After this step, middleware will route you directly into the {config.label.toLowerCase()} app and keep auth pages out of the way.
        </div>
        <FinishOnboardingButton />
      </div>
    </OnboardingShell>
  );
}
