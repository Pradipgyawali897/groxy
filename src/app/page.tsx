import { Image } from "@/components/ui/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, PackageCheck, Quote, Sparkles, Store } from "lucide-react";

import { BookGrid } from "@/features/catalog/book-grid";
import { RecommendationShelf } from "@/features/reco/recommendation-shelf";
import { RecentlyViewedShelf } from "@/features/reco/recently-viewed-shelf";
import { TrendingShelf } from "@/features/reco/trending-shelf";
import { SectionHeading } from "@/features/shared/section-heading";
import { normalizeCloudinaryUrl } from "@/lib/books";
import { groupCatalogBooks, listPublishedBooks } from "@/lib/catalog";
import { getPortalImageUrls } from "@/lib/portal-images";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, getAuthedPath } from "@/lib/roles";

export default async function HomePage() {
  const [{ role, isOnboarded, canAccessAdmin }, books, portalImages] = await Promise.all([
    getViewerContext(),
    listPublishedBooks(8),
    getPortalImageUrls(),
  ]);

  const heroImage = books[0]?.cover_image_url ?? portalImages.customer;
  const featuredBooks = books.slice(0, 4);
  const { categories, authors } = groupCatalogBooks(books);

  return (
    <main className="overflow-hidden">
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-sm text-primary">
            <Sparkles className="size-4" />
            Premium bookstore marketplace
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl font-heading text-5xl tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Discover beautifully curated books and sell through a calmer kind of marketplace.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Groxy combines a refined bookstore experience, a structured onboarding flow,
              and clear role-based workspaces for readers, sellers, and marketplace operators.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={role || isOnboarded ? getAuthedPath({ role, isOnboarded, canAccessAdmin }) : APP_ROUTES.signUp}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-medium text-primary-foreground"
            >
              {isOnboarded ? "Open my workspace" : "Start your account"}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href={APP_ROUTES.books}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card/80 px-6 text-sm font-medium text-foreground hover:bg-muted"
            >
              Browse catalog
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: BookOpenText,
                title: "Curated catalog",
                copy: "Minimal browsing with rich detail pages, wishlist intent, and bookstore tone.",
              },
              {
                icon: Store,
                title: "Seller studio",
                copy: "Thoughtful tools for store setup, inventory control, and order visibility.",
              },
              {
                icon: PackageCheck,
                title: "Clean operations",
                copy: "Role-aware dashboards and a safer auth flow built around onboarding.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-sm">
                <item.icon className="size-5 text-primary" />
                <h2 className="mt-4 font-heading text-2xl tracking-tight">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-3 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.45)]">
            <Image
              src={normalizeCloudinaryUrl(heroImage, 1800)}
              alt="Premium bookstore storefront"
              width={1800}
              height={1400}
              priority
              className="h-[420px] w-full rounded-[1.5rem] object-cover"
            />
            <div className="absolute inset-x-8 bottom-8 rounded-[1.5rem] border border-white/15 bg-black/45 p-5 text-white backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-white/72">Featured collection</p>
              <p className="mt-3 font-heading text-3xl tracking-tight">
                Designed for browsing like a premium reading room.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {authors.slice(0, 2).map((author) => (
              <Link
                key={author.slug}
                href={`/authors/${author.slug}`}
                className="rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Trending author</p>
                <h3 className="mt-3 font-heading text-2xl tracking-tight">{author.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{author.count} featured titles in catalog</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[
          {
            title: "Browse with confidence",
            body: "Clear categories, rich covers, and focused detail pages reduce decision fatigue.",
          },
          {
            title: "Onboard without confusion",
            body: "Identity creation stays separate from role setup so onboarding can do the real routing work.",
          },
          {
            title: "Operate with structure",
            body: "Customer, merchant, and admin spaces share one platform but keep their responsibilities clean.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-[1.75rem] border border-border/70 bg-card/85 p-6 shadow-sm">
            <h2 className="font-heading text-3xl tracking-tight">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured books"
          title="Handpicked titles to anchor the storefront"
          description="Book-first cards, quiet typography, and consistent product presentation make the catalog feel premium from the first scroll."
        />
        <BookGrid books={featuredBooks} />
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
        <TrendingShelf />
        <RecommendationShelf />
        <RecentlyViewedShelf />
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr_1fr] lg:px-8">
        <div className="rounded-[1.75rem] border border-border/70 bg-card/85 p-6 shadow-sm lg:col-span-2">
          <SectionHeading
            eyebrow="Browse by category"
            title="Popular shelves with a literary, warm editorial tone"
            description="Categories and authors act like guided entry points instead of dumping users into a faceless grid."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4 text-sm hover:bg-muted"
              >
                <p className="font-medium text-foreground">{category.name}</p>
                <p className="mt-1 text-muted-foreground">{category.count} books available</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-foreground p-6 text-background shadow-sm">
          <Quote className="size-5 text-background/70" />
          <p className="mt-6 font-heading text-3xl tracking-tight">
            “It feels less like a crowded marketplace and more like a bookstore I’d actually return to.”
          </p>
          <p className="mt-6 text-sm text-background/70">Early merchant feedback on the new Groxy experience</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="rounded-[1.75rem] border border-border/70 bg-card/85 p-6 shadow-sm">
          <SectionHeading
            eyebrow="For sellers"
            title="A merchant experience that respects focus"
            description="Store setup, inventory, orders, and analytics live in one structured studio, instead of scattered pages and unclear states."
          />
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground">
            <li className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">Dedicated onboarding for store identity and brand assets</li>
            <li className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">Clear split between public browsing and merchant operations</li>
            <li className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">Future-ready structure for analytics, orders, and merchandising</li>
          </ul>
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-primary p-8 text-primary-foreground shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/75">Start with confidence</p>
          <h2 className="mt-4 font-heading text-5xl tracking-tight">
            One authentication flow. One onboarding flow. Clear routes after that.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/85">
            Signup creates identity only. Onboarding captures profile, role, and workspace data.
            Middleware then routes users by role and onboarding state without loops.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={APP_ROUTES.signUp}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-background px-6 text-sm font-medium text-foreground"
            >
              Begin onboarding
            </Link>
            <Link
              href={APP_ROUTES.merchantHome}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 px-6 text-sm font-medium text-primary-foreground"
            >
              Explore merchant space
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
