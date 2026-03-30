import { EmptyPanel } from "@/features/dashboard/empty-panel";
import { SectionHeading } from "@/features/shared/section-heading";
import { APP_ROUTES } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MerchantOrdersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyPanel
        title="Sign in to manage orders"
        description="Merchant order operations require an authenticated workspace."
        actionLabel="Sign in"
        actionHref={APP_ROUTES.signIn}
      />
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id,status,payment_status,total,placed_at,created_at,user_id,order_items(title_snapshot,quantity,unit_price)")
    .eq("merchant_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <EmptyPanel
        title="Could not load merchant orders"
        description={error.message}
        actionLabel="Back to dashboard"
        actionHref={APP_ROUTES.merchantHome}
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
    user_id: string;
    order_items?: Array<{
      title_snapshot: string;
      quantity: number;
      unit_price: number;
    }>;
  }>;

  if (!orders.length) {
    return (
      <EmptyPanel
        title="No merchant orders yet"
        description="As soon as customers check out, the merchant workspace will show fulfillment-ready orders here."
        actionLabel="View listings"
        actionHref={APP_ROUTES.merchantBooks}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Operations"
          title="Incoming orders"
          description="Review each order, validate payment state, and use the line items to prepare fulfillment."
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
                  Buyer {order.user_id.slice(0, 8)} • {new Date(order.placed_at ?? order.created_at).toLocaleString()}
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
          </article>
        ))}
      </div>
    </div>
  );
}
