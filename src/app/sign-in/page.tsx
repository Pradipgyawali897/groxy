import Link from "next/link";
import { redirect } from "next/navigation";

import { EmailMagicLinkForm, EmailSignInForm, OAuthButtons } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { normalizeNextPath, resolvePostAuthRedirect } from "@/lib/redirects";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES } from "@/lib/roles";

function getFriendlyDestination(path: string | null) {
  if (!path) return "your workspace";
  if (path.startsWith("/customer")) return "your reader space";
  if (path.startsWith("/merchant")) return "your seller workspace";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/books")) return "the book catalog";
  return "your page";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ next, error }, viewer] = await Promise.all([searchParams, getViewerContext()]);
  const safeNext = normalizeNextPath(next);

  if (viewer.user) {
    redirect(
      resolvePostAuthRedirect({
        next,
        role: viewer.role,
        isOnboarded: viewer.isOnboarded,
        onboardingStep: viewer.onboardingStep,
        canAccessAdmin: viewer.canAccessAdmin,
      })
    );
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back"
      description="Sign in with Google, password, or a magic link."
      sideTitle="Buy and sell secondhand books."
      sideBody="Access your saved books, cart, orders, or seller tools."
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
        <div className="rounded-md border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
          {safeNext
            ? `You will continue to ${getFriendlyDestination(safeNext)}.`
            : "You will continue to your workspace."}
        </div>
        <OAuthButtons nextPath={next} />
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="bg-card px-4">Or use email</span>
          </div>
        </div>
        <EmailSignInForm nextPath={next} />
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="bg-card px-4">Or magic link</span>
          </div>
        </div>
        <EmailMagicLinkForm nextPath={next} />
      </div>
    </AuthShell>
  );
}
