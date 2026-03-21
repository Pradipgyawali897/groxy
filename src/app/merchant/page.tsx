import { MetricGrid } from "@/features/dashboard/metric-grid";
import { SectionHeading } from "@/features/shared/section-heading";
import { getMerchantDashboardData } from "@/lib/dashboard-data";

export default async function MerchantDashboardPage() {
  const { workspace, books, orderCount } = await getMerchantDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Merchant overview"
          title={workspace?.store_name ?? "Your store"}
          description="Track the health of your catalog, see how much inventory is live, and keep your store presentation polished."
        />
      </section>
      <MetricGrid
        metrics={[
          {
            label: "Books listed",
            value: String(books.length),
            meta: "All statuses",
          },
          {
            label: "Published",
            value: String(books.filter((book) => book.status === "published").length),
            meta: "Visible to customers",
          },
          {
            label: "Orders",
            value: String(orderCount),
            meta: "Ready for operations",
          },
          {
            label: "Approval",
            value: workspace?.approved ? "Approved" : "Pending",
            meta: "Merchant verification state",
          },
        ]}
      />
    </div>
  );
}
