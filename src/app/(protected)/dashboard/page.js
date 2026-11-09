"use client";

import { useAuth } from "@/hooks/useAuth";

import UserDashboard from "@/components/dashboard/user/UserDashboard";
import AgentDashboard from "@/components/dashboard/agent/AgentDashboard";
import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <p>Loading dashboard...</p>;
  }

  switch (user.role) {
    case "user":
      return <UserDashboard />;

    case "agent":
      return <AgentDashboard />;

    case "admin":
      return <AdminDashboard />;

    default:
      return <p>Invalid dashboard role.</p>;
  }
}
