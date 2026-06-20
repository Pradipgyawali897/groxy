import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AdminBookCard } from "@/features/admin/admin-book-card";
import { SectionHeading } from "@/features/shared/section-heading";
import { BOOK_STATUSES } from "@/lib/books";
import { listAdminBooks } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const books = await listAdminBooks({ limit: 120, q: params.q, status: params.status });

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Catalog control" title="Book moderation" description="Review listing status, featured placement, stock, and price." />
      <form className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_200px_120px]">
        <Input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search title, author, genre"
          className="h-10 rounded-md px-3"
        />
        <Select name="status" defaultValue={params.status ?? ""}>
          <option value="">All statuses</option>
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Filter
        </button>
      </form>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {books.map((book) => (
          <AdminBookCard key={book.id} book={book} />
        ))}
      </section>
    </div>
  );
}
