import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminPanel } from "@/components/admin-panel";
import { GroxyLogo } from "@/components/groxy-logo";
import { getSessionUser, isAdminEmail } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/admin");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const admin = createSupabaseAdminClient();
  const [booksRes, customersRes, merchantsRes, inquiriesRes] = await Promise.all([
    admin.from("books").select("id,title,author,status,is_featured,stock,price,seller_email").order("updated_at", { ascending: false }).limit(120),
    admin.from("customer_profiles").select("user_id,display_name,shipping_city").order("created_at", { ascending: false }).limit(120),
    admin.from("merchant_profiles").select("user_id,store_name,business_email,city").order("created_at", { ascending: false }).limit(120),
    admin.from("book_inquiries").select("*", { count: "exact" }),
  ]);

  const stats = {
    books: booksRes.data?.length ?? 0,
    customers: customersRes.data?.length ?? 0,
    merchants: merchantsRes.data?.length ?? 0,
    inquiries: inquiriesRes.count ?? 0,
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <GroxyLogo />
          <span className="rounded-full border border-sky-300/50 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">
            Admin panel
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
          >
            Account
          </Link>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </header>

      <section className="rounded-3xl border border-border/70 bg-[linear-gradient(120deg,rgba(37,99,235,0.09),rgba(14,165,233,0.03))] p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Platform controls</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Moderate listings, monitor customer/merchant growth, and keep marketplace quality high.
        </p>
      </section>

      <AdminPanel
        initial={{
          stats,
          books: booksRes.data ?? [],
          customers: customersRes.data ?? [],
          merchants: merchantsRes.data ?? [],
        }}
      />
    </main>
  );
}
