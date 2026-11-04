import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

import UserDashboard from "@/components/dashboard/user/UserDashboard";
import AgentDashboard from "@/components/dashboard/agent/AgentDashboard";
import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  switch (user.role) {
    case "user":
      return <UserDashboard />;

    case "agent":
      return <AgentDashboard />;

    case "admin":
      return <AdminDashboard />;

    default:
      notFound();
  }
}