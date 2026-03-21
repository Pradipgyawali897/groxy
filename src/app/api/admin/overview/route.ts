import { NextResponse } from "next/server";

import { isSessionAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isSessionAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const [booksRes, customersRes, merchantsRes, adminsRes, inquiriesRes] = await Promise.all([
    admin.from("books").select("*", { count: "exact" }),
    admin.from("customer_preferences").select("*", { count: "exact" }),
    admin.from("merchant_workspaces").select("*", { count: "exact" }),
    admin.from("profiles").select("*", { count: "exact" }).eq("role", "admin"),
    admin.from("book_inquiries").select("*", { count: "exact" }),
  ]);

  if (
    booksRes.error ||
    customersRes.error ||
    merchantsRes.error ||
    adminsRes.error ||
    inquiriesRes.error
  ) {
    return NextResponse.json({ error: "Failed to load admin data." }, { status: 500 });
  }

  return NextResponse.json({
    stats: {
      books: booksRes.count ?? 0,
      customers: customersRes.count ?? 0,
      merchants: merchantsRes.count ?? 0,
      admins: adminsRes.count ?? 0,
      inquiries: inquiriesRes.count ?? 0,
    },
    books: (booksRes.data ?? []).slice(0, 120),
    customers: (customersRes.data ?? []).slice(0, 120),
    merchants: (merchantsRes.data ?? []).slice(0, 120),
    admins: (adminsRes.data ?? []).slice(0, 120),
  });
}
