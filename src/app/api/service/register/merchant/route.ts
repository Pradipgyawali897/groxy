import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  store_name: z.string().min(2).max(160),
  business_email: z.string().email(),
  support_phone: z.string().min(6).max(32).optional(),
  city: z.string().min(2).max(120).optional(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("merchant_profiles").upsert({
    user_id: user.id,
    store_name: parsed.data.store_name,
    business_email: parsed.data.business_email,
    support_phone: parsed.data.support_phone ?? null,
    city: parsed.data.city ?? null,
    approved: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
