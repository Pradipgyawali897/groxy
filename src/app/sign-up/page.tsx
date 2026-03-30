import Link from "next/link";
import { redirect } from "next/navigation";

import { EmailSignUpForm, OAuthButtons } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath } from "@/lib/roles";

export default async function SignUpPage() {
  const viewer = await getViewerContext();

  if (viewer.user) {
    redirect(getAuthedPath(viewer));
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
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
          Account creation only handles identity. Profile, role, and workspace setup continue in guided onboarding right after verification.
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: "Create identity", body: "Start with Google or email without mixing role setup into sign-up." },
            { title: "Choose role", body: "Customer or merchant routing happens in onboarding, not in a fragile auth step." },
            { title: "Enter workspace", body: "The platform hands off into the right dashboard once setup is complete." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
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
