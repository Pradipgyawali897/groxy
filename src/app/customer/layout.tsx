import { redirect } from "next/navigation";

import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { getViewerContext } from "@/lib/profile";
import { APP_ROUTES, CUSTOMER_NAV, getOnboardingPath } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewerContext();

  if (!viewer.user) {
    redirect(`${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.customerHome)}`);
  }

  if (!viewer.isOnboarded) {
    redirect(getOnboardingPath(viewer.onboardingStep));
  }

  if (viewer.role !== "customer") {
    redirect(APP_ROUTES.account);
  }

  return (
    <DashboardShell
      badge="Customer App"
      title="Reader dashboard"
      description="Browse, save, order, and shape your reading profile from one calm workspace."
      nav={CUSTOMER_NAV}
      userEmail={viewer.user.email}
    >
      {children}
    </DashboardShell>
  );
}
