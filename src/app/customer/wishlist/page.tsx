import { EmptyPanel } from "@/features/dashboard/empty-panel";

export default function CustomerWishlistPage() {
  return (
    <EmptyPanel
      title="Your wishlist is ready"
      description="Wishlist storage is part of the new schema and route structure. This view is prepared for saved titles, reminders, and later purchase intent."
      actionLabel="Browse books"
      actionHref="/customer/books"
    />
  );
}
