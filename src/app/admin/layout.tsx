import { redirect } from "next/navigation";

import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { getViewerContext } from "@/lib/profile";
import { ADMIN_NAV, APP_ROUTES, getOnboardingPath } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewerContext();

  if (!viewer.user) {
    redirect(`${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.adminHome)}`);
  }

  if (!viewer.isOnboarded) {
    redirect(getOnboardingPath(viewer.onboardingStep));
  }

  if (viewer.role !== "admin" && !viewer.canAccessAdmin) {
    redirect(APP_ROUTES.account);
  }

  return (
    <DashboardShell
      badge="Admin Console"
      title="Marketplace control"
      description="Keep merchants, content, and bookstore quality structured inside a secure operational dashboard."
      nav={ADMIN_NAV}
      userEmail={viewer.user.email}
    >
      {children}
    </DashboardShell>
  );
}
