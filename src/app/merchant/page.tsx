import Link from "next/link";
import { redirect } from "next/navigation";

import { GroxyLogo } from "@/components/groxy-logo";
import { MerchantStudio } from "@/components/merchant-studio";
import type { BookRecord } from "@/lib/books";
import { getServiceRoleState } from "@/lib/service-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MerchantPage() {
  const roleState = await getServiceRoleState();
  const user = roleState.user;

  if (!user) {
    redirect("/sign-in?next=/merchant");
  }
  if (!roleState.isMerchant) {
    redirect("/service/select?intent=merchant");
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("merchant_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <GroxyLogo />
        <div className="flex gap-2">
          <Link
            href="/customer"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
          >
            Customer view
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
          >
            Account
          </Link>
        </div>
      </header>
      <section className="rounded-3xl border border-border/70 bg-[linear-gradient(120deg,rgba(2,132,199,0.09),rgba(37,99,235,0.03))] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Merchant workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Manage your inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create, update, publish, preview, and delete your book listings with merchant-only controls.
        </p>
      </section>
      <MerchantStudio initialBooks={((data as BookRecord[] | null) ?? [])} />
    </main>
  );
}
