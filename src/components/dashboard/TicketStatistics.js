
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTicket } from "@/hooks/useTicket";

export default function TicketStatistics() {
  const { user } = useAuth();

  const { getTicketStatistics } = useTicket();

  const statistics = getTicketStatistics(user?.id);

  return (
    <section>
      <div>
        <h3>Total Tickets</h3>
        <p>{statistics ? statistics.total : ("You don't have any tickets yet!")}</p>
      </div>

      <div>
        <h3>Resolved Tickets</h3>
        <p>{statistics ? statistics.resolved : ("You don't have any resolved tickets yet!")}</p>
      </div>

      <div>
        <h3>Pending Tickets</h3>
        <p>{statistics ? statistics.pending : ("You don't have any pending tickets yet!")}</p>
      </div>
    </section>
  );
}
