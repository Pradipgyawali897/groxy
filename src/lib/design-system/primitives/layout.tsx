import { cn } from "@/lib/utils";
import React from "react";

export const PageSection = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <section className={cn("mb-24 space-y-8", className)}>
    {children}
  </section>
);

export const ContentContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <main className={cn("mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8", className)}>
    {children}
  </main>
);
