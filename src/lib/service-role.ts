import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getServiceRoleState() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      isCustomer: false,
      isMerchant: false,
      merchantApproved: false,
    };
  }

  const [{ data: customerProfile }, { data: merchantProfile }] = await Promise.all([
    supabase
      .from("customer_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("merchant_profiles")
      .select("user_id,approved")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    user,
    isCustomer: Boolean(customerProfile),
    isMerchant: Boolean(merchantProfile),
    merchantApproved: Boolean(merchantProfile?.approved),
  };
}
