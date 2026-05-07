import { MetricGrid } from "@/features/dashboard/metric-grid";
import { SectionHeading } from "@/features/shared/section-heading";
import { getMerchantDashboardData } from "@/lib/dashboard-data";

export default async function MerchantDashboardPage() {
  const { workspace, books, orderCount } = await getMerchantDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Seller overview"
          title={workspace?.store_name ?? "Your store"}
          description="Current listing health, order load, and approval state."
        />
      </section>
      <MetricGrid
        metrics={[
          {
            label: "Books listed",
            value: String(books.length),
            meta: "Draft and live",
          },
          {
            label: "Published",
            value: String(books.filter((book) => book.status === "published").length),
            meta: "Visible to buyers",
          },
          {
            label: "Orders",
            value: String(orderCount),
            meta: "Fulfillment queue",
          },
          {
            label: "Approval",
            value: workspace?.approved ? "Approved" : "Pending",
            meta: "Seller verification",
          },
        ]}
      />
    </div>
  );
}
