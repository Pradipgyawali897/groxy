import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Profile" },
  { id: 2, label: "Role" },
  { id: 3, label: "Setup" },
  { id: 4, label: "Finish" },
];

export function OnboardingShell({
  step,
  title,
  description,
  asideTitle,
  asideBody,
  children,
}: {
  step: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  asideTitle: string;
  asideBody: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-[calc(100vh-6rem)] items-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(43,91,235,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(212,167,98,0.14),transparent_30%),linear-gradient(to_bottom,rgba(250,248,243,0.98),rgba(244,240,233,1))] dark:bg-[radial-gradient(circle_at_top_left,rgba(43,91,235,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(212,167,98,0.12),transparent_30%),linear-gradient(to_bottom,rgba(18,16,13,0.98),rgba(16,14,12,1))]" />
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.45)] lg:grid-cols-[0.82fr_1.18fr]">
        <section className="border-b border-border/70 bg-foreground px-8 py-8 text-background lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <div className="space-y-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-background/70">
                Onboarding
              </p>
              <h1 className="mt-3 font-heading text-5xl tracking-tight">{asideTitle}</h1>
              <p className="mt-3 max-w-md text-sm leading-7 text-background/72">{asideBody}</p>
            </div>
            <div className="grid gap-3">
              {STEPS.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 transition",
                    item.id === step
                      ? "bg-background text-foreground shadow-sm"
                      : item.id < step
                        ? "bg-background/15 text-background"
                        : "bg-white/5 text-background/70"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                      item.id === step ? "bg-primary text-primary-foreground" : "bg-background/10"
                    )}
                  >
                    {item.id}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-lg space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/75">
                Step {step}
              </p>
              <h2 className="font-heading text-4xl tracking-tight">{title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
