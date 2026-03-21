import type { AppRole } from "@/lib/roles";

export type ProfileRecord = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole | null;
  is_onboarded: boolean;
  onboarding_step: number;
  created_at?: string;
  updated_at?: string;
};

export type CatalogBook = {
  id: string;
  merchant_id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  book_condition?: string;
  price: number;
  original_price: number | null;
  stock: number;
  status: string;
  seller_email: string;
  cover_image_url: string;
  gallery_urls: string[] | null;
  is_featured: boolean;
  average_rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type MerchantWorkspaceRecord = {
  user_id: string;
  store_name: string;
  store_slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  approved: boolean;
  support_email: string | null;
};

export type CustomerPreferenceRecord = {
  user_id: string;
  favorite_genres: string[];
  reading_interests: string[];
  newsletter_opt_in: boolean;
};
