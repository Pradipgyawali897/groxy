import { NextResponse } from "next/server";
import { z } from "zod";

import {
  CLOUDINARY_MAX_FILE_SIZE_BYTES,
  CLOUDINARY_UPLOAD_KINDS,
  isAllowedCloudinaryImageType,
} from "@/lib/cloudinary";
import { createCloudinaryUploadSignature } from "@/lib/cloudinary.server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  fileSize: z.number().int().positive().max(CLOUDINARY_MAX_FILE_SIZE_BYTES),
  kind: z.enum(CLOUDINARY_UPLOAD_KINDS),
  mimeType: z.string().trim().min(1).max(100),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(new Headers(request.headers));
  const limit = checkRateLimit(`cloudinary:sign:${user.id}:${ip}`, {
    windowMs: 10 * 60 * 1000,
    max: 60,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many upload requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_onboarded")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "merchant" || !profile.is_onboarded) {
    return NextResponse.json(
      { error: "Merchant access required" },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!isAllowedCloudinaryImageType(parsed.data.mimeType)) {
    return NextResponse.json(
      {
        error: "Unsupported file type. Upload a JPG, PNG, WebP, or AVIF image.",
      },
      { status: 400 }
    );
  }

  try {
    const signature = createCloudinaryUploadSignature({
      fileName: parsed.data.fileName,
      kind: parsed.data.kind,
      userId: user.id,
    });

    return NextResponse.json(signature);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Cloudinary upload is not configured.",
      },
      { status: 500 }
    );
  }
}
