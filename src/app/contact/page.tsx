import { Mail, MapPin, Phone } from "lucide-react";

import { SectionHeading } from "@/features/shared/section-heading";

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Contact"
        title="Get in touch with the Groxy team"
        description="Use this page for partnerships, merchant onboarding questions, support, or platform operations."
      />
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/85 p-6 shadow-sm">
          {[
            { icon: Mail, label: "Email", value: "hello@groxybooks.com" },
            { icon: Phone, label: "Phone", value: "+1 (555) 012-3488" },
            { icon: MapPin, label: "Office", value: "Rusoxy Commerce Lab, Kathmandu / Remote" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/75 p-4">
              <item.icon className="size-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-card/85 p-6 shadow-sm">
          <p className="font-heading text-4xl tracking-tight">Responses built for real operations</p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            The platform is structured so customer support, seller support, and marketplace
            operations can scale without turning the experience into a cluttered admin mess.
          </p>
        </div>
      </section>
    </main>
  );
}
