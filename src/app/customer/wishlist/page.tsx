import { MasterLayout } from "@/design-system/components/master-layout";
import { GlobalNavigation } from "@/design-system/components/global-navigation";
import { tokens } from "@/design-system/core/tokens";

export default function WishlistPage() {
  return (
    <MasterLayout>
      <GlobalNavigation />
      <main className="mt-16">
        <header className="mb-12">
          <h1 className={tokens.typography.heading + " text-4xl"}>Wishlist</h1>
          <p className={tokens.typography.body + " mt-2"}>
            Your curated collection of future reads.
          </p>
        </header>

        <section className="grid gap-6">
            <div className="py-12 text-center border border-dashed rounded-xl border-zinc-200">
                <p className="text-zinc-500">Your wishlist is currently empty.</p>
            </div>
        </section>
      </main>
    </MasterLayout>
  );
}
