import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { APP_ROUTES } from "@/lib/roles";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="New password"
      title="Choose a new password"
      description="Set a new password after opening the email link."
      sideTitle="Create a new password."
      sideBody="Save it, then sign in again."
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
