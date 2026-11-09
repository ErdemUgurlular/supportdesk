import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";
import { getTickets } from "@/lib/tickets";

import { TicketContextProvider } from "@/context/TicketContext";

import AuthContextSync from "@/components/auth/AuthContextSync";
import SessionRefresher from "@/components/auth/SessionRefresher";
import MainNavigation from "@/components/layout/MainNavigation";

async function ProtectedGateContent({ children }) {
  // =========================================
  // 1. REQUEST AUTHENTICATION
  // =========================================

  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================
  // 2. DETERMINE TICKET ACCESS
  // =========================================

  const modeByRole = {
    user: "mine",
    agent: "assigned",
    admin: "all",
  };

  const mode = modeByRole[user.role];

  if (!mode) {
    redirect("/");
  }

  // =========================================
  // 3. FETCH AUTHORIZED TICKETS
  // =========================================

  const result = await getTickets({
    userId: user.id,
    role: user.role,
    mode,
    sort: "newest",
    paginate: false,
  });

  // =========================================
  // 4. INITIALIZE TICKET CONTEXT
  // =========================================

  const scopeKey = `${user.role}:${user.id}`;

  return (
    <TicketContextProvider
      key={scopeKey}
      initialTickets={result.tickets}
      scopeKey={scopeKey}
    >
      <AuthContextSync user={user} />

      <MainNavigation />

      <SessionRefresher />

      {children}
    </TicketContextProvider>
  );
}

export default async function ProtectedGate({ children }) {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <ProtectedGateContent children={children} />
    </Suspense>
  );
}
