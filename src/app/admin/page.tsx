import { MetricGrid } from "@/features/dashboard/metric-grid";
import { SectionHeading } from "@/features/shared/section-heading";
import { getAdminDashboardData } from "@/lib/dashboard-data";

export default async function AdminDashboardPage() {
  const { books, profiles, merchants, reviewCount } = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Operations overview"
          title="Platform control center"
          description="Manage the supply side, moderation layers, and overall marketplace health from one clear workspace."
        />
      </section>
      <MetricGrid
        metrics={[
          {
            label: "Users",
            value: String(profiles.length),
            meta: "Recently loaded user records",
          },
          {
            label: "Merchants",
            value: String(merchants.length),
            meta: "Store workspaces loaded",
          },
          {
            label: "Books",
            value: String(books.length),
            meta: "Catalog records in snapshot",
          },
          {
            label: "Reviews",
            value: String(reviewCount),
            meta: "Loaded moderation sample",
          },
        ]}
      />
    </div>
  );
}
