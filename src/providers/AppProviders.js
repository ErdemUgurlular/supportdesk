"use client";

import { AuthProvider } from "@/context/AuthContext";
import { TicketContextProvider } from "@/context/TicketContext";

export default function AppProviders({ children, initialUser = null }) {
  return (
    <AuthProvider initialUser={initialUser}>
      <TicketContextProvider>{children}</TicketContextProvider>
    </AuthProvider>
  );
}
