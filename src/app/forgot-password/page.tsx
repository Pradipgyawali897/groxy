import Link from "next/link";
import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ForgotPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md border border-border/70 bg-background/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ForgotPasswordForm />
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
