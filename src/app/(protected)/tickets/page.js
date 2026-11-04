import { redirect } from "next/navigation";

import TicketList from "@/components/tickets/TicketList";
import { getCurrentUser } from "@/lib/auth";
import { getTickets } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export default async function TicketsPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  const mode = user.role === "user" ? "mine" : "all";

  if (user.role === "guest") {
    redirect("/login");
  }

  const result = await getTickets({
    userId: user.id,
    role: user.role,
    mode,
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
      heading={user.role === "user" ? "My Tickets" : "All Tickets"}
      description={
        user.role === "user"
          ? "View and track your support requests."
          : "Manage and monitor support tickets."
      }
    />
  );
}
