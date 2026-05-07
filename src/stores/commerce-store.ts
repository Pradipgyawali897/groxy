"use client";

import { create } from "zustand";

type InventoryEntity = {
  id: string;
  state: "AVAILABLE" | "RESERVED" | "CHECKOUT_PENDING" | "SOLD" | "EXPIRED";
  version?: number;
};

type ReservationEntity = {
  id: string;
  bookId: string;
  expiresAt: string;
};

type CheckoutState = {
  pending: boolean;
  idempotencyKey?: string;
  lastOrderId?: string;
  error?: string;
};

type CommerceStore = {
  marketplaceSlice: {
    eventCursor: number;
    lastEvent?: string;
  };
  inventorySlice: {
    entities: Record<string, InventoryEntity>;
  };
  reservationSlice: {
    entities: Record<string, ReservationEntity>;
    optimistic: Record<string, ReservationEntity>;
  };
  checkoutSlice: CheckoutState;
  abortController?: AbortController;
  markOptimisticReservation: (reservation: ReservationEntity) => void;
  rollbackReservation: (bookId: string) => void;
  commitReservation: (reservation: ReservationEntity) => void;
  beginCheckout: (idempotencyKey: string) => AbortController;
  finishCheckout: (orderId: string) => void;
  failCheckout: (error: string) => void;
};

export const useCommerceStore = create<CommerceStore>((set, get) => ({
  marketplaceSlice: {
    eventCursor: 0,
  },
  inventorySlice: {
    entities: {},
  },
  reservationSlice: {
    entities: {},
    optimistic: {},
  },
  checkoutSlice: {
    pending: false,
  },
  markOptimisticReservation: (reservation) =>
    set((state) => ({
      reservationSlice: {
        ...state.reservationSlice,
        optimistic: {
          ...state.reservationSlice.optimistic,
          [reservation.bookId]: reservation,
        },
      },
      inventorySlice: {
        entities: {
          ...state.inventorySlice.entities,
          [reservation.bookId]: { id: reservation.bookId, state: "RESERVED" },
        },
      },
    })),
  rollbackReservation: (bookId) =>
    set((state) => {
      const { [bookId]: _removed, ...optimistic } = state.reservationSlice.optimistic;
      return {
        reservationSlice: {
          ...state.reservationSlice,
          optimistic,
        },
        inventorySlice: {
          entities: {
            ...state.inventorySlice.entities,
            [bookId]: { id: bookId, state: "AVAILABLE" },
          },
        },
      };
    }),
  commitReservation: (reservation) =>
    set((state) => {
      const { [reservation.bookId]: _removed, ...optimistic } = state.reservationSlice.optimistic;
      return {
        reservationSlice: {
          entities: {
            ...state.reservationSlice.entities,
            [reservation.id]: reservation,
          },
          optimistic,
        },
      };
    }),
  beginCheckout: (idempotencyKey) => {
    get().abortController?.abort();
    const abortController = new AbortController();
    set({
      abortController,
      checkoutSlice: { pending: true, idempotencyKey },
    });
    return abortController;
  },
  finishCheckout: (orderId) =>
    set({
      abortController: undefined,
      checkoutSlice: { pending: false, lastOrderId: orderId },
    }),
  failCheckout: (error) =>
    set({
      abortController: undefined,
      checkoutSlice: { pending: false, error },
    }),
}));
