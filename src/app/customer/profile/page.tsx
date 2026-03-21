import { getViewerContext } from "@/lib/profile";

export default async function CustomerProfilePage() {
  const viewer = await getViewerContext();

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Profile</p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">Reader identity</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
          <p className="text-sm text-muted-foreground">Full name</p>
          <p className="mt-2 font-medium">{viewer.profile?.full_name ?? "Not set"}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="mt-2 font-medium">{viewer.user?.email ?? "Not set"}</p>
        </div>
      </div>
    </section>
  );
}
