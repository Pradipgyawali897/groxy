import { tokens } from "@/design-system/core/tokens";
import { cn } from "@/lib/utils";
import React from "react";

export const MasterLayout = ({ children }: { children: React.ReactNode }) => (
  <div className={cn("min-h-screen", tokens.colors.background)}>
    <div className={tokens.spacing.container}>
      {children}
    </div>
  </div>
);
