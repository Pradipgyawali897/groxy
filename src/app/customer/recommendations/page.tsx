import { SectionHeading } from "@/features/shared/section-heading";
import { BookConcierge } from "@/features/reco/book-concierge";
import { RecommendationShelf } from "@/features/reco/recommendation-shelf";

export default function CustomerRecommendationsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="For you"
          title="Recommended books"
          description="A focused shelf based on books you view, save, and order."
        />
      </section>
      <BookConcierge />
      <RecommendationShelf
        title="Your recommendations"
        description="Ranked from catalog activity and your reading profile."
        limit={16}
      />
    </div>
  );
}
