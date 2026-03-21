import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { APP_ROUTES } from "@/lib/roles";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="New password"
      title="Choose a new password"
      description="Set a strong password and continue back to your bookstore account."
      sideTitle="Finish the reset with a single clear step."
      sideBody="Once updated, you can sign in again and return to onboarding or your role-based dashboard."
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
      <ResetPasswordForm />
    </AuthShell>
  );
}
