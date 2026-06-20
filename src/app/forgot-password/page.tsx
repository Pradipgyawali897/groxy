import Link from "next/link";
import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath } from "@/lib/roles";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, viewer] = await Promise.all([searchParams, getViewerContext()]);

  if (viewer.user) {
    redirect(getAuthedPath(viewer));
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Recover access"
      description="Enter your account email. We will send a reset link."
      sideTitle="Reset your password."
      sideBody="Use the newest email link to choose a new password."
      footer={
        <>
          Back to{" "}
          <Link href={APP_ROUTES.signIn} className="text-foreground hover:text-primary">
            sign in
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
          The reset link opens the password screen.
        </div>
        <ForgotPasswordForm />
      </div>
    </AuthShell>
  );
}
