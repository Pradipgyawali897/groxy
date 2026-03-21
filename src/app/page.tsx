import Image from "next/image";
import Link from "next/link";

import { GroxyLogo } from "@/components/groxy-logo";
import { normalizeCloudinaryUrl } from "@/lib/books";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: featured } = await supabase
    .from("books")
    .select("*")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_2%,rgba(37,99,235,0.14),transparent_42%),radial-gradient(circle_at_90%_5%,rgba(14,165,233,0.15),transparent_38%),linear-gradient(to_bottom,rgba(248,252,255,0.98),rgba(244,249,255,1))] dark:bg-[radial-gradient(circle_at_8%_2%,rgba(59,130,246,0.2),transparent_42%),radial-gradient(circle_at_90%_5%,rgba(14,165,233,0.18),transparent_38%),linear-gradient(to_bottom,rgba(6,12,24,0.98),rgba(4,9,18,1))]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 md:px-10 lg:py-12">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <GroxyLogo />
          <div className="flex items-center gap-2">
            <Link
              href="/customer"
              className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-3 text-sm hover:bg-muted"
            >
              Customer view
            </Link>
            <Link
              href="/merchant"
              className="inline-flex h-9 items-center rounded-lg border border-border bg-background/80 px-3 text-sm hover:bg-muted"
            >
              Merchant view
            </Link>
            <Link
              href={user ? "/dashboard" : "/sign-in"}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground"
            >
              {user ? "My account" : "Sign in"}
            </Link>
          </div>
        </header>

        <section className="grid gap-8 rounded-3xl border border-border/70 bg-card/75 p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-sky-300/40 bg-sky-500/10 px-3 py-1 text-xs font-medium tracking-wide text-sky-700 dark:text-sky-300">
              GROXY • Modern Book Commerce
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Your next book marketplace with two dedicated experiences.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Customers discover and buy. Merchants manage inventory and publish listings.
              Groxy ships with secure auth, role onboarding, Cloudinary images, and webhook-ready data flow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/customer"
                className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm text-primary-foreground"
              >
                Open customer app
              </Link>
              <Link
                href="/merchant"
                className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted"
              >
                Open merchant studio
              </Link>
              <Link
                href="/admin"
                className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted"
              >
                Admin panel
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
            <Image
              src={normalizeCloudinaryUrl(
                "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
                1000
              )}
              alt="Groxy storefront preview"
              width={1200}
              height={900}
              className="h-56 w-full rounded-xl object-cover"
            />
            <div className="mt-4 grid gap-3">
              <article className="rounded-xl border border-border/70 p-3">
                <p className="text-sm font-semibold">Customer lane</p>
                <p className="text-sm text-muted-foreground">
                  Filters, list/grid browsing, detail view, seller mail, and cart flow.
                </p>
              </article>
              <article className="rounded-xl border border-border/70 p-3">
                <p className="text-sm font-semibold">Merchant lane</p>
                <p className="text-sm text-muted-foreground">
                  CRUD listings, publish control, Cloudinary links, and live preview.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
            <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300">Customer experience</p>
            <h2 className="mt-2 text-xl font-semibold">Smooth shopping flow</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Service-based onboarding, clean browsing controls, and purchase-ready contact actions.
            </p>
            <Link href="/customer" className="mt-4 inline-flex text-sm font-medium text-primary">
              Enter customer app →
            </Link>
          </article>
          <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
            <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300">Merchant experience</p>
            <h2 className="mt-2 text-xl font-semibold">Inventory and publishing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dedicated merchant registration and secure inventory controls for listing lifecycle.
            </p>
            <Link href="/merchant" className="mt-4 inline-flex text-sm font-medium text-primary">
              Enter merchant studio →
            </Link>
          </article>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Featured books</h2>
            <Link
              href="/customer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(featured ?? []).map((book) => (
              <Link
                key={book.id}
                href={`/customer/books/${book.id}`}
                className="group overflow-hidden rounded-2xl border border-border/70 bg-card/80"
              >
                <Image
                  src={normalizeCloudinaryUrl(book.cover_image_url, 700)}
                  alt={book.title}
                  width={900}
                  height={1200}
                  className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="space-y-1 p-4">
                  <p className="line-clamp-1 text-base font-semibold">{book.title}</p>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <p className="text-sm font-medium">${Number(book.price).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
