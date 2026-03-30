import { NextResponse } from "next/server";
import { z } from "zod";

import { isSessionAdmin } from "@/lib/admin-auth";
import { syncBookReviewAggregate } from "@/lib/reviews";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["pending", "published", "hidden"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isSessionAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: review, error: reviewError } = await admin
    .from("reviews")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("id,book_id,status")
    .single();

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 400 });
  }

  await syncBookReviewAggregate(review.book_id);

  return NextResponse.json({
    ok: true,
    review,
  });
}
