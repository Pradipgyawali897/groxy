import Link from "next/link";

export function EmptyPanel({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border bg-card/70 p-8 text-center">
      <h3 className="font-heading text-3xl tracking-tight">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm text-primary-foreground"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
