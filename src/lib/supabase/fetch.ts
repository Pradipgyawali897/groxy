import "server-only";

export function getSupabaseTimeoutMs() {
  const raw = process.env.SUPABASE_HTTP_TIMEOUT_MS;
  const ms = raw ? Number(raw) : 6000;
  if (!Number.isFinite(ms) || ms < 1000) return 6000;
  return Math.min(ms, 20000);
}

export function fetchWithTimeout(timeoutMs: number) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    // If the caller already supplied a signal, honor it (don’t override).
    if (init?.signal) {
      return fetch(input, init);
    }

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(t);
    }
  };
}

