import { redirect } from "next/navigation";

export default async function MarketplaceBookAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/customer/books/${id}`);
}
