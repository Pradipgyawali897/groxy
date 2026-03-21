"use client";

import { AddToCartButton as SharedAddToCartButton } from "@/components/add-to-cart-button";

type Item = {
  id: string;
  title: string;
  author: string;
  price: number;
  cover_image_url: string;
  seller_email: string;
};

export function AddToCartButton({ item }: { item: Item }) {
  return <SharedAddToCartButton item={item} />;
}
