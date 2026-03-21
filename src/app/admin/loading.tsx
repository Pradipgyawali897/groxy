export default function AdminLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-3xl bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-[420px] animate-pulse rounded-2xl bg-muted" />
    </main>
  );
}
