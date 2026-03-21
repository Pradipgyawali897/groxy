"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/use-cart";

type CartItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  cover_image_url: string;
  seller_email: string;
};

export function AddToCartButton({ item }: { item: CartItem }) {
  const { addItem } = useCart();
  return (
    <Button size="sm" onClick={() => addItem(item)}>
      Add to cart
    </Button>
  );
}
