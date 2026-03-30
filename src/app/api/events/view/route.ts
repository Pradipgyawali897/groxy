import { NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  book_id: z.string().uuid(),
  surface: z.string().optional(),
});

function getSidFromCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)groxy_sid=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function buildSetSidCookie(sid: string, secure: boolean) {
  // Route handler can set cookies via response headers.
  // Keep it httpOnly so it can’t be stolen by client JS.
  return `groxy_sid=${encodeURIComponent(sid)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;
}

export async function POST(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`events:view:${ip}`, {
    windowMs: 60 * 1000,
    max: 120,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many events. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sid = getSidFromCookie(request.headers.get("cookie"));
  if (!sid) sid = crypto.randomUUID();

  const context = {
    surface: parsed.data.surface ?? null,
    path: request.headers.get("x-pathname") ?? null,
    referrer: request.headers.get("referer") ?? null,
    ua: request.headers.get("user-agent") ?? null,
  };

  if (user) {
    // RLS allows users to insert their own events (if `book_events` exists).
    const { error } = await supabase.from("book_events").insert({
      user_id: user.id,
      book_id: parsed.data.book_id,
      event_type: "view",
      event_weight: 1,
      anon_session_id: sid,
      context,
    });
    // If the table isn’t deployed yet, we still return OK.
    if (error && !String(error.message).toLowerCase().includes("relation")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Anonymous session events require service-role insert (no auth.uid()).
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("book_events").insert({
      anon_session_id: sid,
      book_id: parsed.data.book_id,
      event_type: "view",
      event_weight: 1,
      context,
    });
    if (error && !String(error.message).toLowerCase().includes("relation")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const isSecure = new URL(request.url).protocol === "https:";
  return NextResponse.json(
    { ok: true, sid },
    {
      headers: sid ? { "Set-Cookie": buildSetSidCookie(sid, isSecure) } : undefined,
    }
  );
}
