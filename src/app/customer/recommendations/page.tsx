import { RecommendationShelf } from "@/features/reco/recommendation-shelf";

export default function CustomerRecommendationsPage() {
  return (
    <div className="space-y-8">
      <RecommendationShelf
        title="Your recommendations"
        description="A hybrid ranking mixing popularity, collaborative similarity, and your own intent signals."
        limit={16}
      />
    </div>
  );
}

