import { MasterLayout } from "@/design-system/components/master-layout";
import { GlobalNavigation } from "@/design-system/components/global-navigation";
import { tokens } from "@/design-system/core/tokens";

export default function ComparePage() {
  return (
    <MasterLayout>
      <GlobalNavigation />
      <main className="mt-12 space-y-12">
        <header className="border-b border-zinc-200 pb-8">
          <h1 className={tokens.typography.heading + " text-4xl"}>Compare Copies</h1>
          <p className={tokens.typography.body + " mt-2"}>
            Compare condition, price, and seller ratings to make the best choice.
          </p>
        </header>
        
        {/* Comparison grid will be implemented here */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="h-64 border border-dashed border-zinc-300 rounded-lg flex items-center justify-center text-zinc-400">
                Comparison slot
            </div>
        </section>
      </main>
    </MasterLayout>
  );
}
