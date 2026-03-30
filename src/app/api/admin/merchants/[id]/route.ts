import { NextResponse } from "next/server";
import { z } from "zod";

import { isSessionAdmin } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const merchantPatchSchema = z.object({
  approved: z.boolean().optional(),
  support_email: z.string().email().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isSessionAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`admin:merchant:update:${ip}`, {
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
  const parsed = merchantPatchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("merchant_workspaces")
    .update(parsed.data)
    .eq("user_id", id)
    .select("user_id,store_name,store_slug,description,logo_url,banner_url,approved,support_email")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Merchant workspace not found." }, { status: 404 });
  }

  return NextResponse.json({ merchant: data });
}

