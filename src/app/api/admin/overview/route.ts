import { NextResponse } from "next/server";

import { getSessionUser, isAdminEmail } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const [booksRes, customersRes, merchantsRes, inquiriesRes] = await Promise.all([
    admin.from("books").select("*", { count: "exact" }),
    admin.from("customer_profiles").select("*", { count: "exact" }),
    admin.from("merchant_profiles").select("*", { count: "exact" }),
    admin.from("book_inquiries").select("*", { count: "exact" }),
  ]);

  if (booksRes.error || customersRes.error || merchantsRes.error || inquiriesRes.error) {
    return NextResponse.json({ error: "Failed to load admin data." }, { status: 500 });
  }

  return NextResponse.json({
    stats: {
      books: booksRes.count ?? 0,
      customers: customersRes.count ?? 0,
      merchants: merchantsRes.count ?? 0,
      inquiries: inquiriesRes.count ?? 0,
    },
    books: (booksRes.data ?? []).slice(0, 120),
    customers: (customersRes.data ?? []).slice(0, 120),
    merchants: (merchantsRes.data ?? []).slice(0, 120),
  });
}
