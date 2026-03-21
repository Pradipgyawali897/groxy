type Metric = {
  label: string;
  value: string;
  meta: string;
};

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="mt-3 font-heading text-4xl tracking-tight">{metric.value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{metric.meta}</p>
        </article>
      ))}
    </div>
  );
}
