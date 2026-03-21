import Link from "next/link";
import { redirect } from "next/navigation";

import { MerchantRegistrationForm } from "@/components/service-registration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServiceRoleState } from "@/lib/service-role";

export default async function MerchantServiceRegistrationPage() {
  const roleState = await getServiceRoleState();
  if (!roleState.user) redirect("/sign-in?next=/service/select/merchant");
  if (roleState.isMerchant) redirect("/merchant");

  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md border border-border/70 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle>Register Merchant Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Complete this setup to open your merchant studio and publish books.
          </p>
          <MerchantRegistrationForm />
          <Link
            href="/service/select"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to service selection
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
