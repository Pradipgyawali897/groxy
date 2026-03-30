import { Input } from "@/components/ui/input";
import { AdminUserCard } from "@/features/admin/admin-user-card";
import { listAdminProfiles } from "@/lib/dashboard-data";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const profiles = await listAdminProfiles({ limit: 120, q: params.q });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm sm:grid-cols-[1fr_140px]">
        <Input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search name or email"
          className="h-12 rounded-2xl px-4"
        />
        <button className="h-12 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      {profiles.map((profile) => (
        <AdminUserCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
