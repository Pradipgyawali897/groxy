import {
  CheckCircle2Icon,
  LayoutGridIcon,
  PaletteIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { ModeToggle } from "@/components/mode-toggle";
import { StarterActions } from "@/components/starter-actions";
import { SignOutButton } from "@/components/auth-controls";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(23,23,23,0.08),transparent_40%),linear-gradient(to_bottom,rgba(255,255,255,0.98),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top,_rgba(244,244,245,0.12),transparent_35%),linear-gradient(to_bottom,rgba(10,10,10,0.96),rgba(10,10,10,1))]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 md:px-10 lg:py-12">
        <header className="flex flex-col gap-6 border-b border-border/60 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
              <SparklesIcon className="size-4" />
              Next.js 15 + shadcn/ui starter
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Shop frontend scaffolded and ready for real feature work.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                This project now starts from a practical baseline instead of the
                default placeholder: compatible Next.js setup, shadcn/ui,
                theme switching, and a toast system.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
                >
                  Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
              >
                Sign in
              </Link>
            )}
            <ModeToggle />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border border-border/70 bg-background/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>What is already wired up</CardTitle>
              <CardDescription>
                A clean baseline that matches the current Node 18 runtime on
                this machine.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Next.js app router",
                    description: "TypeScript, ESLint, Tailwind, and src aliases.",
                    icon: LayoutGridIcon,
                  },
                  {
                    title: "shadcn/ui setup",
                    description: "Neutral theme tokens and common UI primitives.",
                    icon: PaletteIcon,
                  },
                  {
                    title: "Theme support",
                    description: "Light, dark, and system mode via next-themes.",
                    icon: SparklesIcon,
                  },
                  {
                    title: "Client-side feedback",
                    description: "Sonner toast notifications ready to use.",
                    icon: CheckCircle2Icon,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-border/70 bg-muted/40 p-4"
                    >
                      <div className="mb-3 inline-flex rounded-lg border border-border/60 bg-background p-2">
                        <Icon className="size-4" />
                      </div>
                      <h2 className="text-sm font-medium">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-background/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>Starter smoke test</CardTitle>
              <CardDescription>
                Use this to confirm the starter packages are behaving as
                expected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StarterActions />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
