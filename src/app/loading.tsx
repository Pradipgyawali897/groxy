import Image from "next/image";

import { normalizeCloudinaryUrl } from "@/lib/books";

export default function RootLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <div className="h-10 w-56 animate-pulse rounded-xl bg-muted" />
      <section className="grid gap-6 rounded-3xl border border-border/70 bg-card/70 p-5 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-12 w-full animate-pulse rounded bg-muted" />
          <div className="h-12 w-11/12 animate-pulse rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-10 w-36 animate-pulse rounded bg-muted" />
            <div className="h-10 w-36 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/70">
          <Image
            src={normalizeCloudinaryUrl(
              "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
              900
            )}
            alt="Loading preview"
            width={1200}
            height={900}
            className="h-64 w-full animate-pulse object-cover"
          />
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-72 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </main>
  );
}
