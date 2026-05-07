import { MasterLayout } from "@/design-system/components/master-layout";
import { GlobalNavigation } from "@/design-system/components/global-navigation";
import { tokens } from "@/design-system/core/tokens";

export default function OrdersPage() {
  return (
    <MasterLayout>
      <GlobalNavigation />
      <main className="mt-16">
        <header className="mb-12">
          <h1 className={tokens.typography.heading + " text-4xl"}>Order History</h1>
          <p className={tokens.typography.body + " mt-2"}>
            Track your past purchases and fulfillment status.
          </p>
        </header>

        <section className="space-y-6">
            <div className="flex items-center justify-between p-6 border border-zinc-200 rounded-xl">
                <div>
                    <p className="font-medium">No recent orders found</p>
                    <p className="text-sm text-zinc-500">Your purchases will appear here once processed.</p>
                </div>
            </div>
        </section>
      </main>
    </MasterLayout>
  );
}
