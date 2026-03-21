import { z } from "zod";

export const BOOK_CONDITIONS = ["new", "like_new", "good", "fair", "poor"] as const;
export const BOOK_STATUSES = ["draft", "published", "archived"] as const;

export const merchantBookSchema = z.object({
  title: z.string().min(2).max(160),
  author: z.string().min(2).max(120),
  description: z.string().min(20).max(3000),
  genre: z.string().min(2).max(80),
  book_condition: z.enum(BOOK_CONDITIONS),
  language: z.string().min(2).max(40).default("English"),
  price: z.number().nonnegative(),
  original_price: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().min(0).max(1000).default(1),
  cover_image_url: z.string().url(),
  gallery_urls: z.array(z.string().url()).default([]),
  status: z.enum(BOOK_STATUSES).default("draft"),
  is_featured: z.boolean().default(false),
});

export type MerchantBookInput = z.infer<typeof merchantBookSchema>;

export type BookRecord = {
  id: string;
  merchant_id: string;
  seller_email: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  book_condition: (typeof BOOK_CONDITIONS)[number];
  language: string;
  price: number;
  original_price: number | null;
  stock: number;
  cover_image_url: string;
  gallery_urls: string[];
  status: (typeof BOOK_STATUSES)[number];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export const inquiryWebhookSchema = z.object({
  book_id: z.string().uuid(),
  buyer_email: z.string().email(),
  buyer_name: z.string().min(1).max(120).optional(),
  message: z.string().min(10).max(4000),
});

export function normalizeCloudinaryUrl(url: string, width = 960) {
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }
  if (url.includes("/image/upload/")) {
    return url.replace(
      "/image/upload/",
      `/image/upload/f_auto,q_auto,dpr_auto,c_limit,w_${width}/`
    );
  }
  return url;
}
