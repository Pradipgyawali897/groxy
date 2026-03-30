import Link from "next/link";
import { redirect } from "next/navigation";

import { EmailMagicLinkForm, EmailSignInForm, OAuthButtons } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getRoleHome } from "@/lib/roles";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ next, error }, viewer] = await Promise.all([searchParams, getViewerContext()]);

  if (viewer.user) {
    redirect(viewer.isOnboarded ? getRoleHome(viewer.role) : APP_ROUTES.onboardingStep1);
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back"
      description="Return to your bookstore workspace, continue onboarding, or jump back into the catalog."
      sideTitle="A smoother bookstore flow starts with simpler authentication."
      sideBody="We keep identity and onboarding separate so account creation stays reliable and the role decision happens in a guided place."
      footer={
        <>
          New here?{" "}
          <Link href={APP_ROUTES.signUp} className="text-foreground hover:text-primary">
            Create an account
          </Link>{" "}
          or{" "}
          <Link href={APP_ROUTES.forgotPassword} className="text-foreground hover:text-primary">
            reset your password
          </Link>
          .
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <OAuthButtons nextPath={next} />
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span className="bg-card px-4">Or use email</span>
          </div>
        </div>
        <EmailSignInForm nextPath={next} />
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span className="bg-card px-4">Or email a link</span>
          </div>
        </div>
        <EmailMagicLinkForm nextPath={next} />
      </div>
    </AuthShell>
  );
}
