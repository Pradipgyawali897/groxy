import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth-controls";
import { GroxyLogo } from "@/components/groxy-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getRoleConfig, getRoleHome } from "@/lib/roles";

export default async function AccountPage() {
  const viewer = await getViewerContext();
  const user = viewer.user;

  if (!user) {
    redirect(APP_ROUTES.signIn);
  }

  const profile = viewer.profile;
  const role = viewer.role;

  if (!viewer.isOnboarded) {
    redirect(APP_ROUTES.onboardingStep1);
  }

  if (!role) {
    redirect(APP_ROUTES.landing);
  }

  const config = getRoleConfig(role);

  return (
    <main className="flex-1 px-6 py-8 md:px-10 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <GroxyLogo />
          <div className="flex items-center gap-2">
            <Link
              href={APP_ROUTES.landing}
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              Home
            </Link>
            <SignOutButton />
          </div>
        </header>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm lg:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Account
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight">
                {profile?.full_name ?? user.user_metadata?.full_name ?? "Welcome back"}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                This account is assigned to the {config.label.toLowerCase()} workspace.
              </p>
            </div>
            <Link
              href={getRoleHome(role)}
              className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm text-primary-foreground"
            >
              Open {config.label} app
            </Link>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-border/70 bg-background/85">
            <CardHeader>
              <CardTitle>Account summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="mt-1 text-sm font-medium">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <p className="text-sm text-muted-foreground">Assigned portal</p>
                <p className="mt-1 text-sm font-medium">{config.shortLabel}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <p className="text-sm text-muted-foreground">Primary route</p>
                <p className="mt-1 text-sm font-medium">{config.homePath}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <p className="text-sm text-muted-foreground">Access pattern</p>
                <p className="mt-1 text-sm font-medium">Single account, single portal</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-background/85">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Link
                href={getRoleHome(role)}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/70 px-4 py-3 hover:bg-muted/60"
              >
                <span>Launch current app</span>
                <span className="text-muted-foreground">{config.homePath}</span>
              </Link>
              <Link
                href={APP_ROUTES.resetPassword}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/70 px-4 py-3 hover:bg-muted/60"
              >
                <span>Update password</span>
                <span className="text-muted-foreground">Security</span>
              </Link>
              <Link
                href={APP_ROUTES.landing}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/70 px-4 py-3 hover:bg-muted/60"
              >
                <span>Return to storefront</span>
                <span className="text-muted-foreground">Public site</span>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
