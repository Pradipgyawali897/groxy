import { getMerchantDashboardData } from "@/lib/dashboard-data";
import { PageSection } from "@/lib/design-system/primitives/layout";

export default async function MerchantDashboardPage() {
  const { workspace, books, orderCount } = await getMerchantDashboardData();

  const metrics = [
    { label: "Active Listings", value: String(books.filter((b) => b.status === "published").length) },
    { label: "Drafts", value: String(books.filter((b) => b.status === "draft").length) },
    { label: "Orders", value: String(orderCount) },
    { label: "Status", value: workspace?.approved ? "Approved" : "Pending" },
  ];

  return (
    <PageSection className="space-y-12">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <h1 className="font-heading text-3xl">{workspace?.store_name ?? "Your Store"}</h1>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Seller Studio</span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-2 font-heading text-2xl">{m.value}</p>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
