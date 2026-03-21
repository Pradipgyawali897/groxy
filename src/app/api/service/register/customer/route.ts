import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  display_name: z.string().min(2).max(120),
  shipping_city: z.string().min(2).max(120).optional(),
  phone: z.string().min(6).max(32).optional(),
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

  const { error } = await supabase.from("customer_profiles").upsert({
    user_id: user.id,
    display_name: parsed.data.display_name,
    shipping_city: parsed.data.shipping_city ?? null,
    phone: parsed.data.phone ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
