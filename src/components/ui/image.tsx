"use client";

import NextImage, { ImageProps as NextImageProps } from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ImageProps extends NextImageProps {
  fallbackSrc?: string;
  fallbackText?: string;
}

export function Image({ src, fallbackSrc, fallbackText = "Image unavailable", alt, className, ...rest }: ImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    if (fallbackSrc) {
      return (
        <NextImage
          src={fallbackSrc}
          alt={alt}
          className={className}
          {...rest}
        />
      );
    }
    
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-muted text-muted-foreground ${className || ''}`}
        {...(rest.fill ? { style: { position: 'absolute', inset: 0 } } : { style: { width: rest.width, height: rest.height } })}
      >
        <ImageOff className="size-8 opacity-50 mb-2" />
        <span className="text-xs font-medium opacity-50">{fallbackText}</span>
      </div>
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        setError(true);
      }}
      {...rest}
    />
  );
}
