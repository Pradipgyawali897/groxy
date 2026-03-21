import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { assertClientEnv, env } from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  assertClientEnv();
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called in Server Components where writing cookies may be restricted.
        }
      },
    },
  });
}
