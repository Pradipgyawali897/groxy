import { Input } from "@/components/ui/input";
import { AdminMerchantCard } from "@/features/admin/admin-merchant-card";
import { listAdminMerchants } from "@/lib/dashboard-data";

export default async function AdminMerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const merchants = await listAdminMerchants({ limit: 120, q: params.q });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm sm:grid-cols-[1fr_140px]">
        <Input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search stores, slug, support email"
          className="h-12 rounded-2xl px-4"
        />
        <button className="h-12 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      {merchants.map((merchant) => (
        <AdminMerchantCard key={merchant.user_id} merchant={merchant} />
      ))}
    </div>
  );
}
