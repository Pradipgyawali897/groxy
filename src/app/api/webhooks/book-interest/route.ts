import { NextResponse } from "next/server";

import { inquiryWebhookSchema } from "@/lib/books";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const expectedSecret = process.env.GROXY_WEBHOOK_SECRET;
  if (expectedSecret) {
    const headerSecret = request.headers.get("x-groxy-webhook-secret");
    if (headerSecret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
    }
  }

  const payload = await request.json();
  const parsed = inquiryWebhookSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const bookId = parsed.data.book_id;

  const { data: book, error: bookError } = await admin
    .from("books")
    .select("id,seller_email")
    .eq("id", bookId)
    .maybeSingle();

  if (bookError || !book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const { error } = await admin.from("book_inquiries").insert({
    book_id: book.id,
    seller_email: book.seller_email,
    buyer_email: parsed.data.buyer_email,
    buyer_name: parsed.data.buyer_name ?? null,
    message: parsed.data.message,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
