"use client";

import { Image } from "@/components/ui/image";
import * as React from "react";

import { normalizeCloudinaryUrl } from "@/lib/books";

export function BookGallery({
  title,
  images,
}: {
  title: string;
  images: string[];
}) {
  const [selected, setSelected] = React.useState(0);
  const safeImages = images.filter(Boolean);
  const activeImage = safeImages[selected] ?? safeImages[0];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/70">
        <Image
          src={normalizeCloudinaryUrl(activeImage, 1100)}
          alt={title}
          width={1200}
          height={1500}
          priority
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="w-full object-cover"
        />
      </div>
      {safeImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelected(index)}
              className={`overflow-hidden rounded-xl border ${selected === index ? "border-primary" : "border-border/70"} bg-background/70`}
            >
              <Image
                src={normalizeCloudinaryUrl(image, 260)}
                alt={`${title} preview ${index + 1}`}
                width={280}
                height={340}
                sizes="120px"
                className="h-24 w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
