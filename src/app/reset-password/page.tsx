import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth-controls";
import { AuthShell } from "@/features/auth/auth-shell";
import { APP_ROUTES } from "@/lib/roles";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="New password"
      title="Choose a new password"
      description="Set a strong password after opening the secure recovery link from your email."
      sideTitle="Finish the reset with a single clear step."
      sideBody="The recovery link signs you into a short-lived secure session first. Once you save the new password, you can sign in again and continue normally."
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
