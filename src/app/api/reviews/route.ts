import { NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  book_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(2).max(120).optional().or(z.literal("")),
  body: z.string().min(20).max(1500),
});

export async function POST(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`reviews:create:${ip}`, { windowMs: 60 * 1000, max: 20 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many review attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review payload." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: user.id,
      book_id: parsed.data.book_id,
      rating: parsed.data.rating,
      title: parsed.data.title?.trim() || null,
      body: parsed.data.body.trim(),
      status: "pending",
    },
    { onConflict: "user_id,book_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Review submitted for moderation.",
  });
}
