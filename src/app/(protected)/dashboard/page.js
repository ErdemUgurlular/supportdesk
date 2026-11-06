"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

import UserDashboard from "@/components/dashboard/user/UserDashboard";
import AgentDashboard from "@/components/dashboard/agent/AgentDashboard";
import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";

export default function DashboardPage() {
  const router = useRouter();

  const { user, isLoading, authError } = useAuth();

  // Redirect guests after authentication check finishes.
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // 1. Wait for authentication verification.
  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  // 2. Handle unauthenticated users.
  if (!user) {
    return (
      <p>
        {authError
          ? "Unable to verify your session. Redirecting..."
          : "Redirecting to login..."}
      </p>
    );
  }

  // 3. Display the appropriate dashboard.
  switch (user.role) {
    case "user":
      return <UserDashboard />;

    case "agent":
      return <AgentDashboard />;

    case "admin":
      return <AdminDashboard />;

    default:
      return <p>Your account does not have a valid dashboard role.</p>;
  }
}
