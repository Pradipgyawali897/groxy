import { GroxyLogo } from "@/components/groxy-logo";

export function AuthShell({
  eyebrow,
  title,
  description,
  sideTitle,
  sideBody,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sideTitle: string;
  sideBody: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-[calc(100vh-6rem)] items-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(43,91,235,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(212,167,98,0.14),transparent_34%),linear-gradient(to_bottom,rgba(250,248,243,0.98),rgba(244,240,233,1))] dark:bg-[radial-gradient(circle_at_top_left,rgba(83,124,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(212,167,98,0.12),transparent_34%),linear-gradient(to_bottom,rgba(18,16,13,0.98),rgba(16,14,12,1))]" />
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.45)] lg:grid-cols-[0.88fr_1.12fr]">
        <section className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,rgba(33,37,48,0.96),rgba(18,18,24,0.96))] p-8 text-white lg:border-b-0 lg:border-r lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,115,255,0.35),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(212,167,98,0.22),transparent_30%)]" />
          <div className="relative space-y-8">
            <div className="flex items-center justify-between gap-4">
              <GroxyLogo mybackground="different" />
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/80">
                Secure access
              </span>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/70">
                {eyebrow}
              </p>
              <h1 className="font-heading text-5xl leading-tight tracking-tight">
                {sideTitle}
              </h1>
              <p className="max-w-md text-sm leading-7 text-white/72">{sideBody}</p>
            </div>
            <div className="grid gap-3 text-sm text-white/75">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Google, magic-link, and password login all land in the same callback and continue into the correct workspace.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Identity is created first. Role and preferences are collected in onboarding.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Middleware routes readers, merchants, and admins without redirect loops.
              </div>
            </div>
          </div>
        </section>
        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/75">
                {eyebrow}
              </p>
              <h2 className="font-heading text-4xl tracking-tight">{title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1">
                Callback-safe
              </span>
              <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1">
                Role-aware
              </span>
              <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1">
                Production flow
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Role-aware return",
                  body: "Readers, merchants, and admins land in the right workspace after auth.",
                },
                {
                  title: "Session continuity",
                  body: "Password, Google, and magic-link flows all feed one post-auth redirect model.",
                },
                {
                  title: "Recovery ready",
                  body: "Reset and onboarding stay in the same secure route family instead of splitting the flow.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
            {children}
            {footer ? <div className="text-sm text-muted-foreground">{footer}</div> : null}
            <p className="text-xs leading-6 text-muted-foreground">
              By continuing, you agree to a cleaner onboarding flow for role, preferences,
              and storefront setup.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
