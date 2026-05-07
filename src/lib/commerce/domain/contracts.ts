import { z } from "zod";

export const reservationLockDurationMs = 10 * 60 * 1000;

export const inventoryStateSchema = z.enum([
  "AVAILABLE",
  "RESERVED",
  "CHECKOUT_PENDING",
  "SOLD",
  "EXPIRED",
]);

export type InventoryState = z.infer<typeof inventoryStateSchema>;

export const commerceEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("BOOK_RESERVED"),
    payload: z.object({
      bookId: z.string().uuid(),
      buyerId: z.string().uuid(),
      reservationId: z.string().uuid(),
      expiresAt: z.string(),
    }),
  }),
  z.object({
    type: z.literal("RESERVATION_EXPIRED"),
    payload: z.object({
      bookId: z.string().uuid(),
      reservationId: z.string().uuid(),
    }),
  }),
  z.object({
    type: z.literal("CHECKOUT_STARTED"),
    payload: z.object({
      orderId: z.string().uuid(),
      buyerId: z.string().uuid(),
      idempotencyKey: z.string().min(8),
    }),
  }),
  z.object({
    type: z.literal("PAYMENT_SUCCEEDED"),
    payload: z.object({
      orderId: z.string().uuid(),
      amount: z.number().nonnegative(),
      provider: z.string(),
    }),
  }),
  z.object({
    type: z.literal("INVENTORY_RELEASED"),
    payload: z.object({
      bookId: z.string().uuid(),
      reason: z.enum(["reservation_expired", "checkout_rollback", "cart_removed"]),
    }),
  }),
  z.object({
    type: z.literal("BOOK_MARKED_SOLD"),
    payload: z.object({
      bookId: z.string().uuid(),
      orderId: z.string().uuid(),
    }),
  }),
]);

export type CommerceEvent = Readonly<z.infer<typeof commerceEventSchema>>;

export const reserveBookCommandSchema = z.object({
  bookId: z.string().uuid(),
  buyerId: z.string().uuid(),
  cartId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(160).optional(),
});

export const checkoutCommandSchema = z.object({
  buyerId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(160),
});

export type ReserveBookCommand = z.infer<typeof reserveBookCommandSchema>;
export type CheckoutCommand = z.infer<typeof checkoutCommandSchema>;

export type ReservationResult = Readonly<{
  reservationId: string;
  bookId: string;
  expiresAt: string;
  state: InventoryState;
}>;

export type CheckoutResult = Readonly<{
  orderId: string;
  total: number;
  status: "paid" | "pending";
}>;
