"use client";

import Link from "next/link";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
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

export default function AdminDashboard() {
  const { getAllTicketStatistics, getRecentTickets, isLoading, error } =
    useTicket();

  const statistics = getAllTicketStatistics();
  const recentTickets = getRecentTickets(6);

  const statCards = [
    { label: "Total Tickets", value: statistics.total },
    { label: "Open Tickets", value: statistics.open },
    { label: "In Progress", value: statistics.inProgress },
    { label: "Resolved Tickets", value: statistics.resolved },
    { label: "Closed Tickets", value: statistics.closed },
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
            <h2>Recent Tickets</h2>
            <p>Latest support requests across the system.</p>
          </div>

          <Link href="/tickets" className={styles.link}>
            Manage Tickets →
          </Link>
        </div>

        {isLoading ? (
          <p className={styles.message}>Loading tickets...</p>
        ) : error ? (
          <p className={styles.error}>Unable to load tickets.</p>
        ) : recentTickets.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No tickets available</h3>
            <p>There are no support tickets in the system yet.</p>
          </div>
        ) : (
          <div className={styles.ticketList}>
            {recentTickets.map((ticket) => {
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
                        {ticket.ticketNumber ??
                          String(ticketId ?? "").slice(-6)}
                      </span>

                      <span>Priority: {ticket.priority ?? "Normal"}</span>

                      <span>Created: {formatDate(ticket.createdAt)}</span>
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

      <section className={styles.quickLinks}>
        <h2>Administration</h2>

        <div className={styles.quickLinkGrid}>
          <Link href="/admin/users" className={styles.quickLinkCard}>
            <h3>Manage Users</h3>
            <p>View and manage system users and support agents.</p>
          </Link>

          <Link href="/admin/reports" className={styles.quickLinkCard}>
            <h3>Reports</h3>
            <p>Review ticket statistics and system activity.</p>
          </Link>

          <Link href="/tickets" className={styles.quickLinkCard}>
            <h3>All Tickets</h3>
            <p>View and manage all submitted tickets.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
