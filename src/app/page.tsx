import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookGrid } from "@/features/catalog/book-grid";
import { TrendingShelf } from "@/features/reco/trending-shelf";
import { listPublishedBooks } from "@/lib/catalog";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath } from "@/lib/roles";
import { PageSection, ContentContainer } from "@/lib/design-system/primitives/layout";

export default async function HomePage() {
  const [{ role, isOnboarded, canAccessAdmin }, books] = await Promise.all([
    getViewerContext(),
    listPublishedBooks(8),
  ]);

  const featuredBooks = books.slice(0, 4);

  return (
    <ContentContainer>
      <PageSection className="space-y-7">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Independent secondhand books
        </p>
        <h1 className="max-w-4xl font-heading text-5xl tracking-tight text-foreground sm:text-7xl">
          Find specific copies from trusted local sellers.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Browse available books by condition, seller, genre, and price. Reserve a copy before checkout so it cannot be sold twice.
        </p>
        <div className="flex gap-4">
          <Link
            href={role || isOnboarded ? getAuthedPath({ role, isOnboarded, canAccessAdmin }) : APP_ROUTES.signUp}
            className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background"
          >
            {isOnboarded ? "Open account" : "Create account"}
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link
            href={APP_ROUTES.books}
            className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm font-medium hover:bg-muted"
          >
            Browse books
          </Link>
        </div>
      </PageSection>

      <PageSection>
        <div className="mb-12 flex items-baseline justify-between border-b border-border pb-6">
          <h2 className="font-heading text-3xl">Available now</h2>
          <Link href={APP_ROUTES.books} className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <BookGrid books={featuredBooks} />
      </PageSection>

      <PageSection className="mb-0">
        <TrendingShelf />
      </PageSection>
    </ContentContainer>
  );
}
