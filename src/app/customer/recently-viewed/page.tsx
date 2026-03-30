import { RecentlyViewedShelf } from "@/features/reco/recently-viewed-shelf";

export default function CustomerRecentlyViewedPage() {
  return (
    <div className="space-y-8">
      <RecentlyViewedShelf limit={16} />
    </div>
  );
}

