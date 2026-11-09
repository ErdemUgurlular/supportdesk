"use client";

import { useAuth } from "@/hooks/useAuth";

import TicketsPageContent from "@/components/tickets/TicketsPageContent";

export default async function TicketsPage({ searchParams }) {
  const { user } = useAuth();

  return (
    <TicketsPageContent
      user={user}
      mode="mine"
      heading="My Tickets"
      description="View and track your support requests."
      searchParams={searchParams}
    />
  );
}
