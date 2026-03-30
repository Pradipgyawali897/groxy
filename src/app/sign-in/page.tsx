import Link from "next/link";
import { redirect } from "next/navigation";

import { EmailMagicLinkForm, EmailSignInForm, OAuthButtons } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { normalizeNextPath } from "@/lib/redirects";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath } from "@/lib/roles";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ next, error }, viewer] = await Promise.all([searchParams, getViewerContext()]);
  const safeNext = normalizeNextPath(next);

  if (viewer.user) {
    redirect(getAuthedPath(viewer));
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
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
          {safeNext
            ? `After authentication you will continue to ${safeNext}.`
            : "After authentication you will continue into onboarding or your assigned workspace."}
        </div>
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
