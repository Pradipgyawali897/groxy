import "server-only";

import type {
  CheckoutCommand,
  CheckoutResult,
  ReserveBookCommand,
  ReservationResult,
} from "@/lib/commerce/domain/contracts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class SupabaseCommerceRepository {
  async reserveBook(command: ReserveBookCommand): Promise<ReservationResult> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("reserve_secondhand_book", {
      p_book_id: command.bookId,
      p_buyer_id: command.buyerId,
      p_cart_id: command.cartId,
      p_idempotency_key: command.idempotencyKey ?? null,
    });

    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("Reservation failed.");

    return {
      reservationId: row.reservation_id,
      bookId: row.book_id,
      expiresAt: row.expires_at,
      state: row.state,
    };
  }

  async releaseBook(bookId: string, buyerId: string) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("release_reserved_book", {
      p_book_id: bookId,
      p_buyer_id: buyerId,
      p_reason: "cart_removed",
    });
    if (error) throw error;
  }

  async checkout(command: CheckoutCommand): Promise<CheckoutResult> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("checkout_reserved_cart", {
      p_buyer_id: command.buyerId,
      p_idempotency_key: command.idempotencyKey,
    });

    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("Checkout failed.");

    return {
      orderId: row.order_id,
      total: Number(row.total ?? 0),
      status: row.status,
    };
  }

  async expireReservations() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("expire_stale_reservations");
    if (error) throw error;
    return Number(data ?? 0);
  }
}
