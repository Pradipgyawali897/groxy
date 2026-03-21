import { EmptyPanel } from "@/features/dashboard/empty-panel";

export default function CustomerCartPage() {
  return (
    <EmptyPanel
      title="Your cart will appear here"
      description="The schema includes carts and cart items, and this route is ready for the customer checkout flow."
      actionLabel="Keep browsing"
      actionHref="/customer/books"
    />
  );
}
