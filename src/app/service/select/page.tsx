import Link from "next/link";
import { redirect } from "next/navigation";

import { GroxyLogo } from "@/components/groxy-logo";
import { getServiceRoleState } from "@/lib/service-role";

export default async function ServiceSelectPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const params = await searchParams;
  const roleState = await getServiceRoleState();
  if (!roleState.user) redirect("/sign-in?next=/service/select");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex items-center justify-between">
        <GroxyLogo />
        <span className="text-sm text-muted-foreground">{roleState.user.email}</span>
      </header>
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Choose your service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer and Merchant are separate service entities. Register each one
          individually with the same account.
        </p>
        {params.intent ? (
          <p className="mt-2 text-sm text-sky-700 dark:text-sky-300">
            You need {params.intent} registration to access that area.
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
          <p className="text-lg font-semibold">Customer service</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse books, inspect details, save to cart, and contact sellers.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">
              {roleState.isCustomer ? "Registered" : "Not registered"}
            </span>
            {roleState.isCustomer ? (
              <Link
                href="/customer"
                className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
              >
                Open customer app
              </Link>
            ) : (
              <Link
                href="/service/select/customer"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground"
              >
                Register customer
              </Link>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-border/70 bg-card/80 p-5">
          <p className="text-lg font-semibold">Merchant service</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create and manage inventory, publish listings, and receive buyer inquiries.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">
              {roleState.isMerchant ? "Registered" : "Not registered"}
            </span>
            {roleState.isMerchant ? (
              <Link
                href="/merchant"
                className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
              >
                Open merchant app
              </Link>
            ) : (
              <Link
                href="/service/select/merchant"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground"
              >
                Register merchant
              </Link>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
