import { NextResponse } from "next/server";
import { z } from "zod";

import { ClerkAgent } from "@/lib/commerce/agents/commerce-agents";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  idempotency_key: z.string().min(8).max(160),
});

export async function POST(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`checkout:${ip}`, { windowMs: 60 * 1000, max: 20 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
  }

  try {
    const clerk = new ClerkAgent();
    const checkout = await clerk.runCheckout({
      buyerId: user.id,
      idempotencyKey: parsed.data.idempotency_key,
    });

    return NextResponse.json({ ok: true, checkout });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Checkout could not be completed." },
      { status: 409 }
    );
  }
}
