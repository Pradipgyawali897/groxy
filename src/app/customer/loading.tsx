import Image from "next/image";

import { normalizeCloudinaryUrl } from "@/lib/books";

export default function CustomerLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
      <div className="overflow-hidden rounded-2xl border border-border/70">
        <Image
          src={normalizeCloudinaryUrl(
            "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            900
          )}
          alt="Loading customer books"
          width={1200}
          height={700}
          className="h-44 w-full animate-pulse object-cover"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-80 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </main>
  );
}
