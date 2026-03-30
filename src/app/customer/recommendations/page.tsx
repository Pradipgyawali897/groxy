import { SectionHeading } from "@/features/shared/section-heading";
import { RecommendationShelf } from "@/features/reco/recommendation-shelf";

export default function CustomerRecommendationsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Recommendation engine"
          title="A shelf that reacts to what you actually do"
          description="Recommendations now adapt to your views, wishlist intent, purchases, and genre patterns instead of falling back to a generic featured list."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            "Views update session intent so the shelf changes during the current visit.",
            "Wishlist and purchases increase author and genre confidence for stronger matches.",
            "Every card can explain why it appeared, so the ranking feels less random.",
          ].map((copy) => (
            <div key={copy} className="rounded-2xl border border-border/70 bg-background/75 p-4 text-sm leading-6 text-muted-foreground">
              {copy}
            </div>
          ))}
        </div>
      </section>
      <RecommendationShelf
        title="Your recommendations"
        description="A hybrid ranking mixing popularity, collaborative similarity, and your own intent signals."
        limit={16}
      />
    </div>
  );
}
