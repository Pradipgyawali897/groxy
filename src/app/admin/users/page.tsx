import { getAdminDashboardData } from "@/lib/dashboard-data";

export default async function AdminUsersPage() {
  const { profiles } = await getAdminDashboardData();

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <article
          key={profile.id}
          className="rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm"
        >
          <p className="font-medium">{profile.full_name ?? "Unnamed user"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.email} • {profile.role ?? "unassigned"} • {profile.is_onboarded ? "onboarded" : "onboarding"}
          </p>
        </article>
      ))}
    </div>
  );
}
