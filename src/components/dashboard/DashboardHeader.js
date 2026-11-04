"use client";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardHeader() {
  const { name } = useAuth();

  return (
    <>
      <h1>Dashboard</h1>
      <p>Welcome back, {name ? name : "User"}!</p>
    </>
  );
}
