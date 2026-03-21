import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth-controls";
import { GroxyLogo } from "@/components/groxy-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase());

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <GroxyLogo />
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
          >
            Home
          </Link>
          <SignOutButton />
        </div>
      </header>

      <Card className="border border-border/70 bg-background/90">
        <CardHeader>
          <CardTitle>Account dashboard</CardTitle>
          <CardDescription>
            Protected by Supabase middleware and server-side user checks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">User:</span>{" "}
            {profile?.full_name ?? user.user_metadata?.full_name ?? "Unknown"}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            {user.email ?? "Not provided"}
          </p>
          <p>
            <span className="text-muted-foreground">User ID:</span>{" "}
            {user.id}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/customer"
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              Open customer view
            </Link>
            <Link
              href="/merchant"
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              Open merchant view
            </Link>
            <Link
              href="/customer/cart"
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              Open cart
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
              >
                Open admin panel
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
