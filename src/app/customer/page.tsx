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
          eyebrow="Overview"
          title="Your bookstore home"
          description="Pick up where you left off with recommendations, saved preferences, and a cleaner view of your reading activity."
        />
      </section>

      <MetricGrid
        metrics={[
          {
            label: "Preferred genres",
            value: String(preferences?.favorite_genres.length ?? 0),
            meta: "Saved during onboarding",
          },
          {
            label: "Reading interests",
            value: String(preferences?.reading_interests.length ?? 0),
            meta: "Used for future recommendations",
          },
          {
            label: "Orders",
            value: String(ordersCount),
            meta: "Track fulfilment and re-orders",
          },
          {
            label: "Newsletter",
            value: preferences?.newsletter_opt_in ? "On" : "Off",
            meta: "Curated updates preference",
          },
        ]}
      />

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Recommended"
          title="Continue browsing with a curated shelf"
          description="These featured books are ready to move from discovery into your wishlist or cart."
        />
        <BookGrid books={books.slice(0, 4)} compact />
      </section>

      <RecommendationShelf
        title="Recommended for you"
        description="Updated as you view books, save wishlist items, and place orders."
        limit={8}
      />
      <RecentlyViewedShelf limit={8} />
    </div>
  );
}
