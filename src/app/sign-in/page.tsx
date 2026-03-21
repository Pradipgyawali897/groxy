import Link from "next/link";
import { redirect } from "next/navigation";

import {
  EmailSignInForm,
  OAuthButtons,
} from "@/components/auth-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/service/select";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(30,30,30,0.07),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),transparent_38%)]" />
      <Card className="w-full max-w-md border border-border/70 bg-background/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <OAuthButtons nextPath={nextPath} />
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Email and password</p>
            <EmailSignInForm nextPath={nextPath} />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/sign-up" className="text-muted-foreground hover:text-foreground">
              Create account
            </Link>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
