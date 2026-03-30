"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function HeaderDropdown({
  align = "end",
  panelClassName,
  trigger,
  children,
}: {
  align?: "start" | "end";
  panelClassName?: string;
  trigger: (args: { open: boolean; toggle: () => void; close: () => void }) => React.ReactNode;
  children: (args: { close: () => void }) => React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const close = React.useCallback(() => {
    setOpen(false);
  }, []);

  const toggle = React.useCallback(() => {
    setOpen((value) => !value);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target || rootRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={rootRef} className="relative">
      {trigger({ open, toggle, close })}
      <div
        aria-hidden={!open}
        className={cn(
          "absolute top-[calc(100%+0.75rem)] z-50 transition duration-200",
          align === "end" ? "right-0" : "left-0",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        )}
      >
        <div
          role="menu"
          className={cn(
            "w-80 overflow-hidden rounded-[1.5rem] border border-border/70 bg-popover/95 p-2 text-popover-foreground shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl",
            panelClassName
          )}
        >
          {children({ close })}
        </div>
      </div>
    </div>
  );
}
