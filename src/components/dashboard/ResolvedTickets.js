
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

export default function ResolvedTickets() {
  const { user } = useAuth();

  const { getTicketsByStatus, isLoading, error } = useTicket();

  const tickets = getTicketsByStatus(user?.id, "resolved");

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Resolved Tickets</h2>
          <p>Your successfully resolved support requests.</p>
        </div>

        <span className={styles.resolvedCount}>
          {tickets.length} Resolved
        </span>
      </div>

      {isLoading ? (
        <p className={styles.message}>Loading tickets...</p>
      ) : error ? (
        <p className={styles.error}>
          Unable to load tickets.
        </p>
      ) : tickets.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No resolved tickets yet</h3>
          <p>
            Your resolved support requests will appear here.
          </p>
        </div>
      ) : (
        <div className={styles.ticketList}>
          {tickets.map((ticket) => {
            const ticketId = ticket._id ?? ticket.id;

            const resolutionDate = ticket.resolvedAt;
            const fallbackDate = ticket.updatedAt;

            return (
              <article
                key={ticketId}
                className={styles.ticketCard}
              >
                <div className={styles.ticketContent}>
                  <div className={styles.ticketHeading}>
                    <h3>
                      {ticket.title ?? "Untitled Ticket"}
                    </h3>

                    <span
                      className={`${styles.status} ${styles.statusResolved}`}
                    >
                      Resolved
                    </span>
                  </div>

                  {ticket.description && (
                    <p className={styles.description}>
                      {ticket.description}
                    </p>
                  )}

                  <div className={styles.ticketMeta}>
                    <span>
                      ID: {ticket.ticketNumber ?? String(ticketId).slice(-6)}
                    </span>

                    <span>
                      {resolutionDate
                        ? `Resolved: ${formatDate(resolutionDate)}`
                        : `Last updated: ${formatDate(fallbackDate)}`}
                    </span>
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
