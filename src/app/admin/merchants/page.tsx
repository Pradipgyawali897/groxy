import { getAdminDashboardData } from "@/lib/dashboard-data";

export default async function AdminMerchantsPage() {
  const { merchants } = await getAdminDashboardData();

  return (
    <div className="space-y-4">
      {merchants.map((merchant) => (
        <article
          key={merchant.user_id}
          className="rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm"
        >
          <p className="font-heading text-2xl tracking-tight">{merchant.store_name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            /{merchant.store_slug} • {merchant.approved ? "approved" : "pending approval"}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {merchant.description ?? "No store description yet."}
          </p>
        </article>
      ))}
    </div>
  );
}
