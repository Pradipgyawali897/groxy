import { NextResponse } from "next/server";

import { merchantBookSchema } from "@/lib/books";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getAuthedUserBook(bookId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, book: null, error: "Unauthorized", status: 401 };
  }

  const { data: merchantRole } = await supabase
    .from("merchant_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!merchantRole) {
    return {
      supabase,
      user,
      book: null,
      error: "Merchant service registration required",
      status: 403,
    };
  }

  const { data: book, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .eq("merchant_id", user.id)
    .maybeSingle();

  if (error) {
    return { supabase, user, book: null, error: error.message, status: 500 };
  }
  if (!book) {
    return { supabase, user, book: null, error: "Book not found", status: 404 };
  }
  return { supabase, user, book, error: null, status: 200 };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getAuthedUserBook(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ book: result.book });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getAuthedUserBook(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const body = await request.json();
  const parsed = merchantBookSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const { data, error } = await result.supabase
    .from("books")
    .update({
      ...payload,
      gallery_urls: payload.gallery_urls ?? result.book?.gallery_urls ?? [],
      original_price:
        payload.original_price !== undefined
          ? payload.original_price
          : result.book?.original_price ?? null,
    })
    .eq("id", id)
    .eq("merchant_id", result.user?.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ book: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getAuthedUserBook(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { error } = await result.supabase
    .from("books")
    .delete()
    .eq("id", id)
    .eq("merchant_id", result.user?.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
