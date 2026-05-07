import { NextResponse } from "next/server";
import { z } from "zod";

import { BrokerAgent } from "@/lib/commerce/agents/commerce-agents";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const addSchema = z.object({
  book_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(1).default(1),
});

const updateSchema = z.object({
  book_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(1),
});

const removeSchema = z.object({
  book_id: z.string().uuid(),
});

async function ensureCartId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string
) {
  const { data: existing, error: existingErr } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingErr) throw existingErr;
  if (existing?.id) return existing.id as string;

  const { data: created, error: createErr } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (createErr) throw createErr;
  return created.id as string;
}

async function loadCart(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string
) {
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (cartError) throw cartError;

  if (!cart?.id) {
    return {
      items: [],
      summary: {
        item_count: 0,
        units_count: 0,
        subtotal: 0,
      },
    };
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id,quantity,unit_price,created_at,book_id,books(id,title,author,genre,price,original_price,stock,status,seller_email,cover_image_url,gallery_urls,is_featured,average_rating,rating_count,merchant_id,description,updated_at,created_at,language,book_condition,inventory_state,inventory_version)"
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const items = (data ?? [])
    .map((row: any) => ({
      id: row.id,
      quantity: row.quantity,
      unit_price: Number(row.unit_price ?? 0),
      created_at: row.created_at,
      book_id: row.book_id,
      book: row.books ?? null,
      line_total: Number(row.unit_price ?? 0) * Number(row.quantity ?? 0),
    }))
    .filter((row) => row.book);

  const unitsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);

  const { data: reservations } = await supabase
    .from("book_reservations")
    .select("id,book_id,status,expires_at")
    .eq("buyer_id", userId)
    .in(
      "book_id",
      items.map((item) => item.book_id)
    );

  return {
    items: items.map((item) => ({
      ...item,
      reservation:
        reservations?.find((reservation) => reservation.book_id === item.book_id) ?? null,
    })),
    summary: {
      item_count: items.length,
      units_count: unitsCount,
      subtotal,
    },
  };
}

async function getAuthedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

export async function GET() {
  const { supabase, userId } = await getAuthedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cart = await loadCart(supabase, userId);
    return NextResponse.json(cart);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Could not load cart." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`cart:add:${ip}`, { windowMs: 60 * 1000, max: 90 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many cart requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { supabase, userId } = await getAuthedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id,title,price,stock,status,inventory_state")
      .eq("id", parsed.data.book_id)
      .eq("status", "published")
      .maybeSingle();

    if (bookError) throw bookError;
    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }
    const cartId = await ensureCartId(supabase, userId);
    const { data: existing, error: existingError } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("cart_id", cartId)
      .eq("book_id", parsed.data.book_id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: "This book is already reserved in your cart.",
        cart: await loadCart(supabase, userId),
      });
    }

    if (Number(book.stock ?? 0) < 1 || book.inventory_state !== "AVAILABLE") {
      return NextResponse.json({ error: "This book is already reserved or sold." }, { status: 409 });
    }

    const broker = new BrokerAgent();
    const reservation = await broker.reserveSecondhandBook({
      bookId: parsed.data.book_id,
      buyerId: userId,
      cartId,
      idempotencyKey: `cart:${cartId}:${parsed.data.book_id}`,
    });

    const { error: insertError } = await supabase.from("cart_items").insert({
      cart_id: cartId,
      book_id: parsed.data.book_id,
      quantity: 1,
      unit_price: book.price,
    });

    if (insertError) throw insertError;

    return NextResponse.json({
      ok: true,
      message: "Book reserved for 10 minutes.",
      reservation,
      cart: await loadCart(supabase, userId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Could not update cart." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`cart:update:${ip}`, { windowMs: 60 * 1000, max: 120 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many cart requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { supabase, userId } = await getAuthedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!cart?.id) {
      return NextResponse.json({ error: "Cart not found." }, { status: 404 });
    }

    if (parsed.data.quantity === 0) {
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id)
        .eq("book_id", parsed.data.book_id);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        ok: true,
        message: "Removed from cart.",
        cart: await loadCart(supabase, userId),
      });
    }

    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("price,stock,status")
      .eq("id", parsed.data.book_id)
      .eq("status", "published")
      .maybeSingle();

    if (bookError) throw bookError;
    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }
    if (parsed.data.quantity > 1 || parsed.data.quantity > Number(book.stock ?? 0)) {
      return NextResponse.json(
        { error: "Secondhand books are unique items and cannot have quantity above 1." },
        { status: 409 }
      );
    }

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: parsed.data.quantity,
        unit_price: book.price,
      })
      .eq("cart_id", cart.id)
      .eq("book_id", parsed.data.book_id);

    if (updateError) throw updateError;

    return NextResponse.json({
      ok: true,
      message: "Cart updated.",
      cart: await loadCart(supabase, userId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Could not update cart." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`cart:remove:${ip}`, { windowMs: 60 * 1000, max: 120 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many cart requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { supabase, userId } = await getAuthedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (cart?.id) {
      const broker = new BrokerAgent();
      await broker.releaseSecondhandBook(parsed.data.book_id, userId);

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id)
        .eq("book_id", parsed.data.book_id);

      if (error) throw error;
    }

    return NextResponse.json({
      ok: true,
      message: "Removed from cart.",
      cart: await loadCart(supabase, userId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Could not remove from cart." },
      { status: 500 }
    );
  }
}
