import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AdminBookCard } from "@/features/admin/admin-book-card";
import { BOOK_STATUSES } from "@/lib/books";
import { listAdminBooks } from "@/lib/dashboard-data";

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const books = await listAdminBooks({ limit: 120, q: params.q, status: params.status });

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm sm:grid-cols-[1fr_220px_140px]">
        <Input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search title, author, genre"
          className="h-12 rounded-2xl px-4"
        />
        <Select name="status" defaultValue={params.status ?? ""}>
          <option value="">All statuses</option>
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <button className="h-12 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground">
          Filter
        </button>
      </form>

      {books.map((book) => (
        <AdminBookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
