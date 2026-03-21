import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md border border-border/70 bg-background/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ResetPasswordForm />
          <div className="text-sm">
            <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
