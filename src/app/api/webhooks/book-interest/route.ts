import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { inquiryWebhookSchema } from "@/lib/books";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function hasValidWebhookSecret(expectedSecret: string, headerSecret: string | null) {
  if (!headerSecret) return false;

  const expected = Buffer.from(expectedSecret);
  const received = Buffer.from(headerSecret);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`webhook:book-interest:${ip}`, {
    windowMs: 5 * 60 * 1000,
    max: 30,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many webhook requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const expectedSecret = process.env.GROXY_WEBHOOK_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 503 }
    );
  }

  const headerSecret = request.headers.get("x-groxy-webhook-secret");
  if (!hasValidWebhookSecret(expectedSecret, headerSecret)) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
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
