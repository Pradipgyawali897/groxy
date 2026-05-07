import Link from "next/link";
import { PageSection, ContentContainer } from "@/lib/design-system/primitives/layout";

export const EditorialHero = ({ title, cta }: { title: string, cta: { label: string, href: string } }) => (
  <PageSection className="flex flex-col items-center text-center">
    <h1 className="max-w-2xl font-heading text-5xl tracking-tight text-foreground sm:text-6xl">
      {title}
    </h1>
    <Link
      href={cta.href}
      className="mt-8 rounded-full border border-foreground/10 px-8 py-3 text-sm font-medium hover:bg-foreground hover:text-background transition"
    >
      {cta.label}
    </Link>
  </PageSection>
);
