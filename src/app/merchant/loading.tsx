import Image from "next/image";

import { normalizeCloudinaryUrl } from "@/lib/books";

export default function MerchantLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
      <div className="overflow-hidden rounded-2xl border border-border/70">
        <Image
          src={normalizeCloudinaryUrl(
            "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            900
          )}
          alt="Loading merchant dashboard"
          width={1200}
          height={700}
          className="h-44 w-full animate-pulse object-cover"
        />
      </div>
      <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
    </main>
  );
}
