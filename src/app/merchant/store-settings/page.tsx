import { getMerchantDashboardData } from "@/lib/dashboard-data";

export default async function MerchantStoreSettingsPage() {
  const { workspace } = await getMerchantDashboardData();

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Store settings</p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">
        {workspace?.store_name ?? "Store settings"}
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
          <p className="text-sm text-muted-foreground">Store slug</p>
          <p className="mt-2 font-medium">{workspace?.store_slug ?? "Not set"}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
          <p className="text-sm text-muted-foreground">Support email</p>
          <p className="mt-2 font-medium">{workspace?.support_email ?? "Not set"}</p>
        </div>
      </div>
      <p className="mt-6 text-sm leading-7 text-muted-foreground">
        This page is ready for merchant branding, payout, and notification controls in the next iteration.
      </p>
    </section>
  );
}
