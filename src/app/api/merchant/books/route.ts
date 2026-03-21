import { NextResponse } from "next/server";

import { merchantBookSchema } from "@/lib/books";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: merchantRole } = await supabase
    .from("merchant_profiles")
    .select("user_id,business_email")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!merchantRole) {
    return NextResponse.json(
      { error: "Merchant service registration required" },
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

  const { data: merchantRole } = await supabase
    .from("merchant_profiles")
    .select("user_id,business_email")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!merchantRole) {
    return NextResponse.json(
      { error: "Merchant service registration required" },
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
      seller_email: merchantRole.business_email ?? user.email ?? "",
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
