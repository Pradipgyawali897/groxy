"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type InteractiveLinkProps = React.ComponentProps<typeof Link> & {
  pendingClassName?: string;
};

export function InteractiveLink({
  className,
  pendingClassName,
  onClick,
  target,
  children,
  ...props
}: InteractiveLinkProps) {
  const pathname = usePathname();
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setPending(false);
  }, [pathname]);

  return (
    <Link
      {...props}
      target={target}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          target === "_blank" ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        setPending(true);
      }}
      data-pending={pending ? "true" : "false"}
      aria-busy={pending}
      className={cn(
        "transition duration-200",
        pending && "pointer-events-none opacity-70 saturate-75",
        className,
        pending && pendingClassName
      )}
    >
      {children}
    </Link>
  );
}
