"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { useTicket } from "@/hooks/useTicket";

import styles from "./TicketSection.module.css";

const pageConfig = {
  active: {
    title: "My Active Tickets",
    description: "Track the progress of your support requests.",
    emptyTitle: "No active tickets",
    emptyMessage: "You don't have any unresolved tickets.",
    showCreateButton: true,
  },

  mine: {
    title: "My Tickets",
    description: "All support tickets submitted by you.",
    emptyTitle: "No tickets yet",
    emptyMessage: "You haven't submitted any support tickets.",
    showCreateButton: true,
  },

  assigned: {
    title: "Assigned Tickets",
    description: "Manage the tickets assigned to you.",
    emptyTitle: "No assigned tickets",
    emptyMessage: "You currently have no tickets assigned to you.",
    showCreateButton: false,
  },

  all: {
    title: "All Tickets",
    description: "Browse and manage support tickets across the system.",
    emptyTitle: "No tickets available",
    emptyMessage: "There are no support tickets in the system yet.",
    showCreateButton: false,
  },
};

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

export default function MyTickets({ mode = "active" }) {
  const { user } = useAuth();

  const {
    tickets: allTickets,
    getUserTickets,
    getActiveTickets,
    getAssignedTickets,
    filterTicketList,
    isLoading,
    error,
  } = useTicket();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const config = pageConfig[mode] ?? pageConfig.active;

  // Select the appropriate ticket collection
  let sourceTickets = [];

  switch (mode) {
    case "mine":
      sourceTickets = getUserTickets(user?.id);
      break;

    case "assigned":
      sourceTickets = getAssignedTickets(user?.id);
      break;

    case "all":
      sourceTickets = allTickets;
      break;

    case "active":
    default:
      sourceTickets = getActiveTickets(user?.id);
      break;
  }

  // Apply search and status filters through useTicket
  const displayedTickets = filterTicketList(sourceTickets, {
    status: statusFilter,
    search: searchQuery,
  });

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
        </div>

        {config.showCreateButton && (
          <Link href="/tickets/new" className={styles.createLink}>
            + Create Ticket
          </Link>
        )}
      </div>

      {!isLoading && !error && (
        <div className={styles.ticketControls}>
          <input
            type="search"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className={styles.searchInput}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={styles.statusSelect}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      )}

      {isLoading ? (
        <p className={styles.message}>Loading tickets...</p>
      ) : error ? (
        <p className={styles.error}>
          Unable to load tickets. Please try again later.
        </p>
      ) : displayedTickets.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>
            {sourceTickets.length === 0
              ? config.emptyTitle
              : "No matching tickets"}
          </h3>

          <p>
            {sourceTickets.length === 0
              ? config.emptyMessage
              : "Try changing your search or status filter."}
          </p>

          {config.showCreateButton && sourceTickets.length === 0 && (
            <Link href="/tickets/new" className={styles.createLink}>
              Create Ticket
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.ticketList}>
          {displayedTickets.map((ticket) => {
            const ticketId = ticket._id ?? ticket.id;
            const status = normalizeStatus(ticket.status);

            return (
              <article
                key={ticketId ?? ticket.ticketNumber}
                className={styles.ticketCard}
              >
                <div className={styles.ticketContent}>
                  <div className={styles.ticketHeading}>
                    <h3>
                      {ticket.title ?? "Untitled Ticket"}
                    </h3>

                    <span
                      className={`${styles.status} ${
                        styles[
                          status === "in-progress"
                            ? "statusInProgress"
                            : status === "open"
                              ? "statusOpen"
                              : status === "pending"
                                ? "statusPending"
                                : status === "resolved"
                                  ? "statusResolved"
                                  : "statusDefault"
                        ]
                      }`}
                    >
                      {formatStatus(ticket.status)}
                    </span>
                  </div>

                  {ticket.description && (
                    <p className={styles.description}>
                      {ticket.description}
                    </p>
                  )}

                  <div className={styles.ticketMeta}>
                    <span>
                      ID: {ticket.ticketNumber ?? String(ticketId ?? "").slice(-6)}
                    </span>

                    <span>
                      Priority: {ticket.priority ?? "Normal"}
                    </span>

                    <span>
                      Created: {formatDate(ticket.createdAt)}
                    </span>

                    {mode === "all" && ticket.assignedToName && (
                      <span>
                        Assigned to: {ticket.assignedToName}
                      </span>
                    )}
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