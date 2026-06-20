import { groupCatalogBooks, listPublishedBooks } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const books = await listPublishedBooks(32);
  const { categories } = groupCatalogBooks(books);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {categories.map((category) => (
        <article
          key={category.slug}
          className="rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-sm"
        >
          <p className="font-heading text-2xl tracking-tight">{category.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{category.count} books mapped</p>
        </article>
      ))}
    </div>
  );
}
