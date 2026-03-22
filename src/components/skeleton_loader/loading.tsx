export default function LoadingSkeleton() {
  return (
    <div className="loading-container">
      <div className="skeleton-card mb-4 flex items-center gap-3">
        <div className="skeleton skeleton-avatar"></div>
        <div className="skeleton skeleton-text w-36"></div>
      </div>

      {/* Post Skeletons */}
      {[1, 2, 3].map((item) => (
        <div key={item} className="skeleton-card mb-4">
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="skeleton skeleton-avatar"></div>
            <div className="flex flex-col gap-2">
              <div className="skeleton skeleton-text w-28"></div>
              <div className="skeleton skeleton-text-sm w-20"></div>
            </div>
          </div>

          {/* Post Content */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="skeleton skeleton-text w-full"></div>
            <div className="skeleton skeleton-text w-11/12"></div>
            <div className="skeleton skeleton-text w-3/4"></div>
          </div>

          {/* Post Image */}
          <div className="skeleton skeleton-image rounded-lg"></div>

          {/* Post Actions */}
          <div className="flex gap-4 mt-4">
            <div className="skeleton skeleton-text w-16"></div>
            <div className="skeleton skeleton-text w-16"></div>
            <div className="skeleton skeleton-text w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}