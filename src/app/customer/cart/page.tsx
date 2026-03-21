import Link from "next/link";
import { redirect } from "next/navigation";

import { CartView } from "@/components/cart-view";
import { GroxyLogo } from "@/components/groxy-logo";
import { getServiceRoleState } from "@/lib/service-role";

export default async function CustomerCartPage() {
  const roleState = await getServiceRoleState();
  if (!roleState.user) redirect("/sign-in?next=/customer/cart");
  if (!roleState.isCustomer) redirect("/service/select?intent=customer");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <GroxyLogo />
        <Link
          href="/customer"
          className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
        >
          Continue shopping
        </Link>
      </header>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Customer cart</h1>
        <p className="text-sm text-muted-foreground">
          Review items and continue to checkout flow.
        </p>
      </section>
      <CartView />
    </main>
  );
}
