import "server-only";

import { createClient } from "@supabase/supabase-js";

import { assertServerEnv, env } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  assertServerEnv();
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
