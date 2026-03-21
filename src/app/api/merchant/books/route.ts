import { NextResponse } from "next/server";

import { merchantBookSchema } from "@/lib/books";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_onboarded")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "merchant" || !profile.is_onboarded) {
    return NextResponse.json(
      { error: "Merchant access required" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("merchant_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ books: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`merchant:create:${user.id}:${ip}`, {
    windowMs: 10 * 60 * 1000,
    max: 30,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many create requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_onboarded")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "merchant" || !profile.is_onboarded) {
    return NextResponse.json(
      { error: "Merchant access required" },
      { status: 403 }
    );
  }

  const { data: workspace } = await supabase
    .from("merchant_workspaces")
    .select("support_email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!workspace) {
    return NextResponse.json(
      { error: "Merchant workspace setup required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = merchantBookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const { data, error } = await supabase
    .from("books")
    .insert({
      ...payload,
      merchant_id: user.id,
      seller_email: workspace.support_email ?? user.email ?? "",
      gallery_urls: payload.gallery_urls ?? [],
      original_price: payload.original_price ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ book: data }, { status: 201 });
}
