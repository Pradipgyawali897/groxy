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
          meta: "Books loaded for analytics snapshot",
        },
        {
          label: "Merchant stores",
          value: String(merchants.length),
          meta: "Visible store workspaces",
        },
        {
          label: "Active profiles",
          value: String(profiles.filter((profile) => profile.is_onboarded).length),
          meta: "Onboarded accounts in the current snapshot",
        },
        {
          label: "Moderation volume",
          value: String(reviewCount),
          meta: "Review records ready for future moderation dashboards",
        },
      ]}
    />
  );
}
