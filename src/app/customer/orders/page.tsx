import Link from "next/link";

import { EmptyPanel } from "@/features/dashboard/empty-panel";
import { SectionHeading } from "@/features/shared/section-heading";
import { APP_ROUTES } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CustomerOrdersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyPanel
        title="Sign in to see your orders"
        description="Your order history is tied to your account so tracking and re-orders stay consistent."
        actionLabel="Sign in"
        actionHref={APP_ROUTES.signIn}
      />
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id,status,payment_status,total,placed_at,created_at,order_items(title_snapshot,quantity,unit_price)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <EmptyPanel
        title="Could not load orders"
        description={error.message}
        actionLabel="Browse books"
        actionHref={APP_ROUTES.customerBooks}
      />
    );
  }

  const orders = (data ?? []) as Array<{
    id: string;
    status: string;
    payment_status: string;
    total: number;
    placed_at: string | null;
    created_at: string;
    order_items?: Array<{
      title_snapshot: string;
      quantity: number;
      unit_price: number;
    }>;
  }>;

  if (!orders.length) {
    return (
      <EmptyPanel
        title="No orders yet"
        description="Once you start buying books, payment state and fulfilment progress will show here."
        actionLabel="Browse books"
        actionHref={APP_ROUTES.customerBooks}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Orders"
          title="Your order history"
          description="Track payment state, review line items, and return to books you may want to reorder."
        />
      </section>
      <div className="grid gap-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Order</p>
                <h2 className="font-heading text-2xl tracking-tight">#{order.id.slice(0, 8)}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.placed_at ?? order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
                  Status: {order.status}
                </span>
                <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
                  Payment: {order.payment_status}
                </span>
                <span className="rounded-full border border-border/70 bg-primary/10 px-3 py-1 font-medium text-primary">
                  ${Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {(order.order_items ?? []).map((item, index) => (
                <div
                  key={`${order.id}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm"
                >
                  <span className="font-medium">{item.title_snapshot}</span>
                  <span className="text-muted-foreground">
                    {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <Link href={APP_ROUTES.customerBooks} className="text-sm text-primary hover:underline">
                Browse similar books
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
