"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { labelForPath } from "@/components/route-badge";

const SITE_NAME = "Groxy Books";

export function RouteTitleSync() {
  const pathname = usePathname();

  React.useEffect(() => {
    const label = labelForPath(pathname);
    document.title = label === "Home" ? SITE_NAME : `${label} | ${SITE_NAME}`;
  }, [pathname]);

  return null;
}
