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
          description="Current account, seller, catalog, and review signals."
        />
      </section>
      <MetricGrid
        metrics={[
          {
            label: "Users",
            value: String(profiles.length),
            meta: "Loaded accounts",
          },
          {
            label: "Merchants",
            value: String(merchants.length),
            meta: "Seller workspaces",
          },
          {
            label: "Books",
            value: String(books.length),
            meta: "Catalog records",
          },
          {
            label: "Reviews",
            value: String(reviewCount),
            meta: "Moderation records",
          },
        ]}
      />
    </div>
  );
}
