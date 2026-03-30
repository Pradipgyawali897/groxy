import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogBook, CustomerPreferenceRecord, MerchantWorkspaceRecord, ProfileRecord } from "@/types/platform";

export async function getCustomerDashboardData() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      preferences: null,
      books: [] as CatalogBook[],
      ordersCount: 0,
    };
  }

  const [{ data: preferences }, { data: books }, { count: ordersCount }] = await Promise.all([
    supabase
      .from("customer_preferences")
      .select("favorite_genres,reading_interests,newsletter_opt_in")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("books")
      .select("*")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return {
    preferences: (preferences as CustomerPreferenceRecord | null) ?? null,
    books: (books as CatalogBook[] | null) ?? [],
    ordersCount: ordersCount ?? 0,
  };
}

export async function getMerchantDashboardData() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      workspace: null,
      books: [] as CatalogBook[],
      orderCount: 0,
    };
  }

  const [{ data: workspace }, { data: books }, { count: orderCount }] = await Promise.all([
    supabase
      .from("merchant_workspaces")
      .select("store_name,store_slug,description,logo_url,banner_url,approved,support_email")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("books")
      .select("*")
      .eq("merchant_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", user.id),
  ]);

  return {
    workspace: (workspace as MerchantWorkspaceRecord | null) ?? null,
    books: (books as CatalogBook[] | null) ?? [],
    orderCount: orderCount ?? 0,
  };
}

export async function getAdminDashboardData() {
  const admin = createSupabaseAdminClient();
  const [booksRes, profilesRes, merchantsRes, reviewsRes] = await Promise.all([
    admin.from("books").select("*").order("updated_at", { ascending: false }).limit(12),
    admin.from("profiles").select("id,email,full_name,role,is_onboarded,onboarding_step").limit(12),
    admin
      .from("merchant_workspaces")
      .select("user_id,store_name,store_slug,description,logo_url,banner_url,approved,support_email")
      .limit(12),
    admin.from("reviews").select("id,status").limit(12),
  ]);

  return {
    books: (booksRes.data as CatalogBook[] | null) ?? [],
    profiles: (profilesRes.data as ProfileRecord[] | null) ?? [],
    merchants: (merchantsRes.data as MerchantWorkspaceRecord[] | null) ?? [],
    reviewCount: reviewsRes.data?.length ?? 0,
  };
}

export async function listAdminBooks({
  limit = 80,
  q,
  status,
}: {
  limit?: number;
  q?: string;
  status?: string;
}) {
  const admin = createSupabaseAdminClient();
  let query = admin
    .from("books")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  const trimmedQ = q?.trim();
  if (trimmedQ) {
    query = query.or(
      `title.ilike.%${trimmedQ}%,author.ilike.%${trimmedQ}%,genre.ilike.%${trimmedQ}%`
    );
  }
  if (status?.trim()) {
    query = query.eq("status", status.trim());
  }

  const { data } = await query;
  return (data as CatalogBook[] | null) ?? [];
}

export async function listAdminMerchants({
  limit = 80,
  q,
}: {
  limit?: number;
  q?: string;
}) {
  const admin = createSupabaseAdminClient();
  let query = admin
    .from("merchant_workspaces")
    .select("user_id,store_name,store_slug,description,logo_url,banner_url,approved,support_email")
    .order("store_name", { ascending: true })
    .limit(limit);

  const trimmedQ = q?.trim();
  if (trimmedQ) {
    query = query.or(
      `store_name.ilike.%${trimmedQ}%,store_slug.ilike.%${trimmedQ}%,support_email.ilike.%${trimmedQ}%`
    );
  }

  const { data } = await query;
  return (data as MerchantWorkspaceRecord[] | null) ?? [];
}

export async function listAdminProfiles({
  limit = 80,
  q,
}: {
  limit?: number;
  q?: string;
}) {
  const admin = createSupabaseAdminClient();
  let query = admin
    .from("profiles")
    .select("id,email,full_name,role,is_onboarded,onboarding_step")
    .order("updated_at", { ascending: false })
    .limit(limit);

  const trimmedQ = q?.trim();
  if (trimmedQ) {
    query = query.or(`email.ilike.%${trimmedQ}%,full_name.ilike.%${trimmedQ}%`);
  }

  const { data } = await query;
  return (data as ProfileRecord[] | null) ?? [];
}
