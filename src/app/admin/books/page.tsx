import { getAdminDashboardData } from "@/lib/dashboard-data";

export default async function AdminBooksPage() {
  const { books } = await getAdminDashboardData();

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <article
          key={book.id}
          className="rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-heading text-2xl tracking-tight">{book.title}</p>
              <p className="text-sm text-muted-foreground">
                {book.author} • {book.status}
              </p>
            </div>
            <p className="text-sm font-medium">${Number(book.price).toFixed(2)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
