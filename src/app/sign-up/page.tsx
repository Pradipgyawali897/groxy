import Link from "next/link";
import { redirect } from "next/navigation";

import { EmailSignUpForm, OAuthButtons } from "@/components/auth-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SignUpPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(30,30,30,0.07),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),transparent_38%)]" />
      <Card className="w-full max-w-md border border-border/70 bg-background/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <OAuthButtons />
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Email and password</p>
            <EmailSignUpForm />
          </div>
          <div className="text-sm">
            <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
