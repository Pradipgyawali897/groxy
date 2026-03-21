import { getCustomerDashboardData } from "@/lib/dashboard-data";

export default async function CustomerSettingsPage() {
  const { preferences } = await getCustomerDashboardData();

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Settings</p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">Reading preferences</h1>
      <div className="mt-6 space-y-4 text-sm">
        <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
          <p className="text-muted-foreground">Favorite genres</p>
          <p className="mt-2 font-medium">
            {preferences?.favorite_genres?.join(", ") || "No genres saved yet."}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
          <p className="text-muted-foreground">Reading interests</p>
          <p className="mt-2 font-medium">
            {preferences?.reading_interests?.join(", ") || "No interests saved yet."}
          </p>
        </div>
      </div>
    </section>
  );
}
