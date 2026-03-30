"use client";

import * as React from "react";

import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

type ProgressiveBookCoverProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  quality?: number;
  wrapperClassName?: string;
  className?: string;
};

export function ProgressiveBookCover({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority = false,
  loading = "lazy",
  quality,
  wrapperClassName,
  className,
}: ProgressiveBookCoverProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", wrapperClassName)}>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[linear-gradient(135deg,rgba(43,91,235,0.12),rgba(212,167,98,0.12))] animate-pulse-slow transition-opacity duration-500",
          loaded && "opacity-0"
        )}
      />
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={loading}
        quality={quality}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
        fallbackText="Cover unavailable"
        className={cn(
          "transition duration-700",
          loaded ? "scale-100 opacity-100" : "scale-[1.025] opacity-0",
          failed && "bg-muted/90 object-contain p-6",
          className
        )}
      />
    </div>
  );
}
