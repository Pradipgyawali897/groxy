import { NextResponse } from "next/server";
import { z } from "zod";

import { isSessionAdmin } from "@/lib/admin-auth";
import { BOOK_STATUSES } from "@/lib/books";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const adminBookPatchSchema = z.object({
  status: z.enum(BOOK_STATUSES).optional(),
  is_featured: z.boolean().optional(),
  stock: z.number().int().min(0).max(10000).optional(),
  price: z.number().nonnegative().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isSessionAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`admin:update:${ip}`, {
    windowMs: 10 * 60 * 1000,
    max: 80,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many admin update requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const payload = await request.json();
  const parsed = adminBookPatchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("books")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  return NextResponse.json({ book: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isSessionAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`admin:delete:${ip}`, {
    windowMs: 10 * 60 * 1000,
    max: 40,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many admin delete requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("books").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
