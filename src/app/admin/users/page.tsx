import { Input } from "@/components/ui/input";
import { AdminUserCard } from "@/features/admin/admin-user-card";
import { SectionHeading } from "@/features/shared/section-heading";
import { listAdminProfiles } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const profiles = await listAdminProfiles({ limit: 120, q: params.q });

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Accounts" title="User roles" description="Search accounts, confirm onboarding state, and update role assignment." />
      <form className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_120px]">
        <Input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search name or email"
          className="h-10 rounded-md px-3"
        />
        <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {profiles.map((profile) => (
          <AdminUserCard key={profile.id} profile={profile} />
        ))}
      </section>
    </div>
  );
}
