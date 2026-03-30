import "server-only";

import type { AppRole } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const fallbackImages: Record<AppRole, string> = {
  customer: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
  merchant: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
  admin: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
};

export async function getPortalImageUrls() {
  const supabase = await createSupabaseServerClient();
  try {
    const { data } = await supabase
      .from("books")
      .select("cover_image_url")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);

    return {
      customer: data?.[0]?.cover_image_url ?? fallbackImages.customer,
      merchant: data?.[1]?.cover_image_url ?? data?.[0]?.cover_image_url ?? fallbackImages.merchant,
      admin:
        data?.[2]?.cover_image_url ?? data?.[1]?.cover_image_url ?? fallbackImages.admin,
    };
  } catch {
    return fallbackImages;
  }
}
