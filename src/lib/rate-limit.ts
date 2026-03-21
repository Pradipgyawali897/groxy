import "server-only";

type RateLimitConfig = {
  windowMs: number;
  max: number;
};

type BucketState = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __groxyRateLimitStore?: Map<string, BucketState>;
};

function getStore() {
  if (!globalStore.__groxyRateLimitStore) {
    globalStore.__groxyRateLimitStore = new Map();
  }
  return globalStore.__groxyRateLimitStore;
}

export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const store = getStore();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      ok: true,
      remaining: config.max - 1,
      retryAfter: Math.ceil(config.windowMs / 1000),
    };
  }

  if (current.count >= config.max) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    ok: true,
    remaining: config.max - current.count,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}
