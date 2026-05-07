import { BookGrid } from "@/features/catalog/book-grid";
import { MetricGrid } from "@/features/dashboard/metric-grid";
import { RecommendationShelf } from "@/features/reco/recommendation-shelf";
import { RecentlyViewedShelf } from "@/features/reco/recently-viewed-shelf";
import { SectionHeading } from "@/features/shared/section-heading";
import { getCustomerDashboardData } from "@/lib/dashboard-data";

export default async function CustomerDashboardPage() {
  const { books, preferences, ordersCount } = await getCustomerDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Discover"
          title="Pick up your search"
          description="Recommendations, saved books, and order status stay here so browsing stays focused."
        />
      </section>

      <MetricGrid
        metrics={[
          {
            label: "Preferred genres",
            value: String(preferences?.favorite_genres.length ?? 0),
            meta: "Used for recommendations",
          },
          {
            label: "Reading interests",
            value: String(preferences?.reading_interests.length ?? 0),
            meta: "Profile signals",
          },
          {
            label: "Orders",
            value: String(ordersCount),
            meta: "Track fulfilment and re-orders",
          },
          {
            label: "Newsletter",
            value: preferences?.newsletter_opt_in ? "On" : "Off",
            meta: "Email preference",
          },
        ]}
      />

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Recommended"
          title="Books worth checking first"
          description="Available copies selected from the current catalog."
        />
        <BookGrid books={books.slice(0, 4)} compact />
      </section>

      <RecommendationShelf
        title="Recommended for you"
        description="Updated from your recent views, wishlist saves, and orders."
        limit={8}
      />
      <RecentlyViewedShelf limit={8} />
    </div>
  );
}
