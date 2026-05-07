import { Input } from "@/components/ui/input";
import { AdminMerchantCard } from "@/features/admin/admin-merchant-card";
import { SectionHeading } from "@/features/shared/section-heading";
import { listAdminMerchants } from "@/lib/dashboard-data";

export default async function AdminMerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const merchants = await listAdminMerchants({ limit: 120, q: params.q });

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Seller review" title="Merchant verification" description="Approve seller workspaces and maintain support contact records." />
      <form className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_120px]">
        <Input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search stores, slug, support email"
          className="h-10 rounded-md px-3"
        />
        <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {merchants.map((merchant) => (
          <AdminMerchantCard key={merchant.user_id} merchant={merchant} />
        ))}
      </section>
    </div>
  );
}
