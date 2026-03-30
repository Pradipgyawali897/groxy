import "server-only";

import { createClient } from "@supabase/supabase-js";

import { assertServerEnv, env } from "@/lib/supabase/env";
import { fetchWithTimeout, getSupabaseTimeoutMs } from "@/lib/supabase/fetch";

export function createSupabaseAdminClient() {
  assertServerEnv();
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    global: {
      fetch: fetchWithTimeout(getSupabaseTimeoutMs()),
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
