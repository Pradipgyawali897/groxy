import type { InventoryState } from "@/lib/commerce/domain/contracts";

const allowedTransitions: Record<InventoryState, InventoryState[]> = {
  AVAILABLE: ["RESERVED", "SOLD"],
  RESERVED: ["CHECKOUT_PENDING", "AVAILABLE", "EXPIRED"],
  CHECKOUT_PENDING: ["SOLD", "AVAILABLE"],
  SOLD: [],
  EXPIRED: ["AVAILABLE"],
};

export function canTransitionInventory(from: InventoryState, to: InventoryState) {
  return allowedTransitions[from]?.includes(to) ?? false;
}

export function assertInventoryTransition(from: InventoryState, to: InventoryState) {
  if (!canTransitionInventory(from, to)) {
    throw new Error(`Invalid inventory transition: ${from} -> ${to}`);
  }
}
