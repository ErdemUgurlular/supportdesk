import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainNavigation from "@/components/layout/MainNavigation";
import { getCurrentUser } from "@/lib/auth";

async function ProtectedDashboard({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return children;
}

export default function DashboardLayout({ children }) {
  return (
    <>
      <MainNavigation />

      <Suspense fallback={<main>Loading your dashboard...</main>}>
        <ProtectedDashboard>{children}</ProtectedDashboard>
      </Suspense>
    </>
  );
}
