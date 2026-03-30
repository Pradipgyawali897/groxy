import { SectionHeading } from "@/features/shared/section-heading";
import { MerchantBookEditor } from "@/features/merchant/merchant-book-editor";

export default function MerchantNewBookPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
        <SectionHeading
          eyebrow="New listing"
          title="Create a new book listing"
          description="This form writes directly to your Supabase-backed inventory and keeps merchant changes isolated to your own workspace."
        />
      </section>
      <MerchantBookEditor mode="create" />
    </div>
  );
}
