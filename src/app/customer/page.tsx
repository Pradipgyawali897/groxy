import Link from "next/link";
import { redirect } from "next/navigation";

import { CustomerMarketplace } from "@/components/customer-marketplace";
import { GroxyLogo } from "@/components/groxy-logo";
import type { BookRecord } from "@/lib/books";
import { getServiceRoleState } from "@/lib/service-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CustomerPage() {
  const roleState = await getServiceRoleState();
  if (!roleState.user) {
    redirect("/sign-in?next=/customer");
  }
  if (!roleState.isCustomer) {
    redirect("/service/select?intent=customer");
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <GroxyLogo />
        <div className="flex gap-2">
          <Link
            href="/customer/cart"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
          >
            Cart
          </Link>
          <Link
            href="/merchant"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
          >
            Merchant view
          </Link>
        </div>
      </header>
      <section className="rounded-3xl border border-border/70 bg-[linear-gradient(120deg,rgba(37,99,235,0.09),rgba(14,165,233,0.03))] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Customer workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Find your next book</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover books, compare listings, and contact sellers from one clean storefront.
        </p>
      </section>
      <CustomerMarketplace books={((data as BookRecord[] | null) ?? [])} />
    </main>
  );
}
