import { MetricGrid } from "@/features/dashboard/metric-grid";
import { getAdminDashboardData } from "@/lib/dashboard-data";

export default async function AdminAnalyticsPage() {
  const { books, merchants, profiles, reviewCount } = await getAdminDashboardData();

  return (
    <MetricGrid
      metrics={[
        {
          label: "Catalog size",
          value: String(books.length),
          meta: "Loaded books",
        },
        {
          label: "Merchant stores",
          value: String(merchants.length),
          meta: "Seller workspaces",
        },
        {
          label: "Active profiles",
          value: String(profiles.filter((profile) => profile.is_onboarded).length),
          meta: "Onboarded accounts",
        },
        {
          label: "Moderation volume",
          value: String(reviewCount),
          meta: "Review records",
        },
      ]}
    />
  );
}
