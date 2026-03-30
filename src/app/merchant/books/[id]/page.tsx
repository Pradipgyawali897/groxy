import { notFound } from "next/navigation";

import { MerchantBookEditor } from "@/features/merchant/merchant-book-editor";
import { SectionHeading } from "@/features/shared/section-heading";
import { getMerchantBookById } from "@/lib/merchant-books";

export default async function MerchantBookEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getMerchantBookById(id);
  if (!book) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="Edit listing"
          title={`Update: ${book.title}`}
          description="Update pricing, stock, status, and media. Changes apply to your listing immediately based on its publication status."
        />
      </section>
      <MerchantBookEditor mode="edit" book={book} />
    </div>
  );
}

