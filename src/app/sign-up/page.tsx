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
      description="Use Google or email. We will ask for only the details needed next."
      sideTitle="Start your secondhand book account."
      sideBody="Create an account, choose buyer or seller, then enter the right workspace."
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
        <div className="rounded-md border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
          Account setup continues after sign up.
        </div>
        <OAuthButtons nextPath={APP_ROUTES.onboardingStep1} />
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="bg-card px-4">Or use email</span>
          </div>
        </div>
        <EmailSignUpForm />
      </div>
    </AuthShell>
  );
}
