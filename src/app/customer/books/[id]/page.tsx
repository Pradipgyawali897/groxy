import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { normalizeCloudinaryUrl } from "@/lib/books";
import { getServiceRoleState } from "@/lib/service-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CustomerBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const roleState = await getServiceRoleState();
  if (!roleState.user) redirect("/sign-in?next=/customer");
  if (!roleState.isCustomer) redirect("/service/select?intent=customer");

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (!book) notFound();

  const mailSubject = encodeURIComponent(`Interested in: ${book.title}`);
  const mailBody = encodeURIComponent(
    `Hi,\n\nI'm interested in buying "${book.title}" by ${book.author}.\nCan we discuss availability and delivery?\n\nThanks.`
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <Link href="/customer" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to customer app
        </Link>
        <Link
          href="/customer/cart"
          className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
        >
          Cart
        </Link>
      </div>

      <section className="grid gap-6 rounded-3xl border border-border/70 bg-card/80 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <Image
          src={normalizeCloudinaryUrl(book.cover_image_url, 1000)}
          alt={book.title}
          width={1200}
          height={1600}
          className="w-full rounded-2xl object-cover"
        />
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            {book.genre} • {book.book_condition.replace("_", " ")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{book.title}</h1>
          <p className="text-base text-muted-foreground">by {book.author}</p>
          <p className="text-lg font-semibold">${Number(book.price).toFixed(2)}</p>
          <p className="text-sm leading-7 text-muted-foreground">{book.description}</p>
          <div className="rounded-xl border border-border/70 bg-background/70 p-4">
            <p className="text-sm font-medium">Seller contact</p>
            <p className="mt-1 text-sm text-muted-foreground">{book.seller_email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`mailto:${book.seller_email}?subject=${mailSubject}&body=${mailBody}`}
                className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
              >
                Email seller
              </a>
              <AddToCartButton
                item={{
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  price: Number(book.price),
                  cover_image_url: book.cover_image_url,
                  seller_email: book.seller_email,
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
