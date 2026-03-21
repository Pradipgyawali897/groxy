import Link from "next/link";
import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getRoleHome } from "@/lib/roles";

export default async function ForgotPasswordPage() {
  const viewer = await getViewerContext();

  if (viewer.user) {
    redirect(viewer.isOnboarded ? getRoleHome(viewer.role) : APP_ROUTES.onboardingStep1);
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
      <ForgotPasswordForm />
    </AuthShell>
  );
}
