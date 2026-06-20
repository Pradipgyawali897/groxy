import { GroxyLogo } from "@/components/groxy-logo";
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
    <main className="flex min-h-[calc(100vh-6rem)] items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-[0.78fr_1.22fr]">
        <section className="border-b border-border bg-foreground px-8 py-8 text-background lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <GroxyLogo mybackground="different" />
                <span className="inline-flex rounded-md border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/80">
                  Step {step} of 4
                </span>
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-background/70">
                Onboarding
              </p>
              <h1 className="mt-3 font-heading text-3xl tracking-tight">{asideTitle}</h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-background/72">{asideBody}</p>
            </div>
            <div className="grid gap-3">
              {STEPS.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-3 transition",
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
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary/75">
                Step {step}
              </p>
              <h2 className="font-heading text-3xl tracking-tight">{title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${step * 25}%` }}
              />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
