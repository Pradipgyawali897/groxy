import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import {
  CredentialsSignIn,
  SignInButtons,
} from "@/components/auth-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(30,30,30,0.07),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),transparent_38%)]" />
      <Card className="w-full max-w-md border border-border/70 bg-background/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SignInButtons />
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Credentials fallback</p>
            <CredentialsSignIn />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
