import { SectionHeading } from "@/features/shared/section-heading";

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="About Groxy"
        title="A premium bookstore marketplace with a calmer operating model"
        description="Groxy is designed around the belief that book commerce should feel editorial, trustworthy, and intentionally structured."
      />
      <section className="grid gap-6 lg:grid-cols-3">
        {[
          "A warm, high-conversion public storefront for readers.",
          "A merchant studio that keeps inventory and operations focused.",
          "An admin space that treats platform control as a product, not an afterthought.",
        ].map((copy) => (
          <article key={copy} className="rounded-[1.75rem] border border-border/70 bg-card/85 p-6 shadow-sm">
            <p className="text-sm leading-7 text-muted-foreground">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
