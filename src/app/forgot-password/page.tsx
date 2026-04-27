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
      description="Enter the email connected to your account and we’ll send a secure reset link."
      sideTitle="Security should feel calm, not confusing."
      sideBody="Password recovery uses the same reliable Supabase session flow as the rest of the platform."
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
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
          Use the most recent reset email on this device. The link opens a short-lived secure session before you choose a new password.
        </div>
        <ForgotPasswordForm />
      </div>
    </AuthShell>
  );
}
