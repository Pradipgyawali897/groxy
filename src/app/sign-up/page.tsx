import Link from "next/link";
import { redirect } from "next/navigation";

import { EmailSignUpForm, OAuthButtons } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getRoleHome } from "@/lib/roles";

export default async function SignUpPage() {
  const viewer = await getViewerContext();

  if (viewer.user) {
    redirect(viewer.isOnboarded ? getRoleHome(viewer.role) : APP_ROUTES.onboardingStep1);
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Create your bookstore account"
      description="Start with email or Google, then move through a guided onboarding flow for profile, role, and workspace details."
      sideTitle="Sign up once. Choose your path in onboarding."
      sideBody="This avoids brittle sign-up coupling and keeps the customer and merchant journeys intentional, visual, and easy to understand."
      footer={
        <>
          Already have an account?{" "}
          <Link href={APP_ROUTES.signIn} className="text-foreground hover:text-primary">
            Sign in
          </Link>
          .
        </>
      }
    >
      <div className="space-y-4">
        <OAuthButtons nextPath={APP_ROUTES.onboardingStep1} />
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span className="bg-card px-4">Or create with email</span>
          </div>
        </div>
        <EmailSignUpForm />
      </div>
    </AuthShell>
  );
}
