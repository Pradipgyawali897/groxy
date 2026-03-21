import { redirect } from "next/navigation";

import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, MERCHANT_NAV, getOnboardingPath } from "@/lib/roles";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewerContext();

  if (!viewer.user) {
    redirect(`${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.merchantHome)}`);
  }

  if (!viewer.isOnboarded) {
    redirect(getOnboardingPath(viewer.onboardingStep));
  }

  if (viewer.role !== "merchant") {
    redirect(APP_ROUTES.account);
  }

  return (
    <DashboardShell
      badge="Merchant Studio"
      title="Store operations"
      description="Manage your bookstore identity, inventory, orders, and merchant growth with a cleaner dashboard."
      nav={MERCHANT_NAV}
      userEmail={viewer.user.email}
    >
      {children}
    </DashboardShell>
  );
}
