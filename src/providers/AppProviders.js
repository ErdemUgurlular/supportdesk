"use client";

import { AuthProvider } from "@/context/AuthContext";

export default function AppProviders({ children, initialUser = null }) {
  return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
}
