import { NextResponse } from "next/server";

import { getViewerContext } from "@/lib/profile";
import { resolvePostAuthRedirect } from "@/lib/redirects";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const viewer = await getViewerContext();
  if (!viewer.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const next = url.searchParams.get("next");

  return NextResponse.json({
    next: resolvePostAuthRedirect({
      next,
      role: viewer.role,
      isOnboarded: viewer.isOnboarded,
      onboardingStep: viewer.onboardingStep,
      canAccessAdmin: viewer.canAccessAdmin,
    }),
  });
}
