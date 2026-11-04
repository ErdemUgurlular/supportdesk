
"use client";

import Link from "next/link";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { useTicket } from "@/hooks/useTicket";

import styles from "../RoleDashboard.module.css";

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeStatus(status) {
  return String(status ?? "unknown")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export default function AgentDashboard() {
  const { user } = useAuth();

  const {
    getAssignedTickets,
    getAgentTicketStatistics,
    isLoading,
    error,
  } = useTicket();

  const tickets = getAssignedTickets(user?.id);
  const statistics = getAgentTicketStatistics(user?.id);

  const statCards = [
    { label: "Assigned Tickets", value: statistics.total },
    { label: "Open Tickets", value: statistics.open },
    { label: "In Progress", value: statistics.inProgress },
    { label: "Resolved", value: statistics.resolved },
  ];

  return (
    <main className={styles.dashboard}>
      <DashboardHeader />

      <section className={styles.statsGrid}>
        {statCards.map((stat) => (
          <article className={styles.statCard} key={stat.label}>
            <p className={styles.statLabel}>{stat.label}</p>
            <h2 className={styles.statValue}>{stat.value}</h2>
          </article>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Assigned Tickets</h2>
            <p>Tickets assigned to you.</p>
          </div>

          <Link href="/assigned-tickets" className={styles.link}>
            View All →
          </Link>
        </div>

        {isLoading ? (
          <p className={styles.message}>Loading tickets...</p>
        ) : error ? (
          <p className={styles.error}>Unable to load tickets.</p>
        ) : tickets.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No assigned tickets</h3>
            <p>You currently have no tickets assigned to you.</p>
          </div>
        ) : (
          <div className={styles.ticketList}>
            {tickets.slice(0, 6).map((ticket) => {
              const ticketId = ticket._id ?? ticket.id;
              const status = normalizeStatus(ticket.status);

              return (
                <article
                  className={styles.ticketRow}
                  key={ticketId ?? ticket.ticketNumber}
                >
                  <div className={styles.ticketMain}>
                    <h3 className={styles.ticketTitle}>
                      {ticket.title ?? "Untitled Ticket"}
                    </h3>

                    <div className={styles.ticketMeta}>
                      <span>
                        {ticket.ticketNumber ?? String(ticketId ?? "").slice(-6)}
                      </span>

                      <span>
                        Priority: {ticket.priority ?? "Normal"}
                      </span>

                      <span>
                        Created: {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.ticketActions}>
                    <span
                      className={`${styles.status} ${
                        styles[`status_${status}`] ?? styles.statusDefault
                      }`}
                    >
                      {status.replace(/-/g, " ")}
                    </span>

                    {ticketId && (
                      <Link
                        href={`/tickets/${ticketId}`}
                        className={styles.link}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
