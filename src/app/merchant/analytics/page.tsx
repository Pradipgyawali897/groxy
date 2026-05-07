import { MetricGrid } from "@/features/dashboard/metric-grid";
import { getMerchantDashboardData } from "@/lib/dashboard-data";

export default async function MerchantAnalyticsPage() {
  const { books } = await getMerchantDashboardData();
  const publishedBooks = books.filter((book) => book.status === "published");
  const inventoryUnits = books.reduce((sum, book) => sum + book.stock, 0);

  return (
    <MetricGrid
      metrics={[
        {
          label: "Total titles",
          value: String(books.length),
          meta: "Draft and live",
        },
        {
          label: "Published titles",
          value: String(publishedBooks.length),
          meta: "Buyer-facing",
        },
        {
          label: "Inventory units",
          value: String(inventoryUnits),
          meta: "Combined stock count",
        },
        {
          label: "Featured books",
          value: String(books.filter((book) => book.is_featured).length),
          meta: "Promoted inventory",
        },
      ]}
    />
  );
}
