import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { SignOutButton } from "@/components/auth-controls";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Authenticated area</p>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
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
          <CardTitle>Session info</CardTitle>
          <CardDescription>
            This route is protected by middleware and server-side session checks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">User:</span>{" "}
            {session.user?.name ?? "Unknown"}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            {session.user?.email ?? "Not provided"}
          </p>
          <p>
            <span className="text-muted-foreground">User ID:</span>{" "}
            {session.user?.id}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
