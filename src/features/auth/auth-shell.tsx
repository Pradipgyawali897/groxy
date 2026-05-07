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
    <main className="flex min-h-[calc(100vh-6rem)] items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-[0.82fr_1.18fr]">
        <section className="border-b border-border bg-foreground p-8 text-background lg:border-b-0 lg:border-r lg:p-10">
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <GroxyLogo mybackground="different" />
            </div>
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-background/60">
                {eyebrow}
              </p>
              <h1 className="font-heading text-4xl leading-tight tracking-tight">
                {sideTitle}
              </h1>
              <p className="max-w-md text-sm leading-7 text-background/70">{sideBody}</p>
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
            {children}
            {footer ? <div className="text-sm text-muted-foreground">{footer}</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
