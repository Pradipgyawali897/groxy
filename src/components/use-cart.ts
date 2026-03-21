"use client";

import * as React from "react";

const CART_STORAGE_KEY = "groxy-cart-v1";

export type CartItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  cover_image_url: string;
  seller_email: string;
  qty: number;
};

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("groxy-cart-updated"));
}

export function useCart() {
  const [items, setItems] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    setItems(readCart());
    const onUpdate = () => setItems(readCart());
    window.addEventListener("groxy-cart-updated", onUpdate);
    return () => window.removeEventListener("groxy-cart-updated", onUpdate);
  }, []);

  const addItem = (item: Omit<CartItem, "qty">) => {
    const current = readCart();
    const existing = current.find((entry) => entry.id === item.id);
    let next: CartItem[];
    if (existing) {
      next = current.map((entry) =>
        entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
      );
    } else {
      next = [...current, { ...item, qty: 1 }];
    }
    writeCart(next);
    setItems(next);
  };

  const removeItem = (id: string) => {
    const next = readCart().filter((entry) => entry.id !== id);
    writeCart(next);
    setItems(next);
  };

  const updateQty = (id: string, qty: number) => {
    const normalizedQty = Math.max(1, qty);
    const next = readCart().map((entry) =>
      entry.id === id ? { ...entry, qty: normalizedQty } : entry
    );
    writeCart(next);
    setItems(next);
  };

  const clear = () => {
    writeCart([]);
    setItems([]);
  };

  const count = items.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = items.reduce((acc, item) => acc + item.qty * item.price, 0);

  return { items, count, subtotal, addItem, removeItem, updateQty, clear };
}
