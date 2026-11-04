import { redirect } from "next/navigation";

import TicketList from "@/components/tickets/TicketList";
import { getCurrentUser } from "@/lib/auth";
import { getTickets } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export default async function AssignedTicketsPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "agent") {
    redirect("/unauthorized");
  }

  const params = await searchParams;

  const result = await getTickets({
    userId: user.id,
    role: user.role,
    mode: "assigned",
    page: params.page,
    search: params.search,
    status: params.status,
    priority: params.priority,
    sort: params.sort,
  });

  return (
    <TicketList
      tickets={result.tickets}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      totalTickets={result.totalTickets}
      heading="Assigned Tickets"
      description="View and manage the support tickets assigned to you."
    />
  );
}
