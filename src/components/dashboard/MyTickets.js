"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { useTicket } from "@/hooks/useTicket";

import styles from "./TicketSections.module.css";

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

function formatStatus(status) {
  return String(status ?? "Unknown")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function MyTickets() {
  const { user } = useAuth();

  const { getActiveTickets, isLoading, error } = useTicket();

  const tickets = getActiveTickets(user?.id);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>My Active Tickets</h2>
          <p>Track the status of your submitted tickets.</p>
        </div>

        <Link href="/tickets/new" className={styles.createLink}>
          + Create Ticket
        </Link>
      </div>

      {isLoading ? (
        <p className={styles.message}>Loading tickets...</p>
      ) : error ? (
        <p className={styles.error}>Unable to load tickets.</p>
      ) : tickets.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No active tickets</h3>
          <p>You don't have any unresolved tickets.</p>

          <Link href="/tickets/new" className={styles.createLink}>
            Create your first ticket
          </Link>
        </div>
      ) : (
        <div className={styles.ticketList}>
          {tickets.map((ticket) => {
            const ticketId = ticket._id ?? ticket.id;
            const status = normalizeStatus(ticket.status);

            return (
              <article key={ticketId} className={styles.ticketCard}>
                <div className={styles.ticketContent}>
                  <div className={styles.ticketHeading}>
                    <h3>{ticket.title ?? "Untitled Ticket"}</h3>

                    <span
                      className={`${styles.status} ${
                        styles[
                          status === "in-progress"
                            ? "statusInProgress"
                            : status === "open"
                              ? "statusOpen"
                              : status === "pending"
                                ? "statusPending"
                                : "statusDefault"
                        ]
                      }`}
                    >
                      {formatStatus(ticket.status)}
                    </span>
                  </div>

                  {ticket.description && (
                    <p className={styles.description}>{ticket.description}</p>
                  )}

                  <div className={styles.ticketMeta}>
                    <span>
                      ID: {ticket.ticketNumber ?? String(ticketId).slice(-6)}
                    </span>

                    <span>Priority: {ticket.priority ?? "Normal"}</span>

                    <span>Created: {formatDate(ticket.createdAt)}</span>
                  </div>
                </div>

                {ticketId && (
                  <Link
                    href={`/tickets/${ticketId}`}
                    className={styles.detailsLink}
                  >
                    View Details →
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
