import Link from "next/link";
import styles from "./TicketCard.module.css";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function TicketCard({ ticket }) {
  const statusClass = ticket.status?.toLowerCase().replace(/[_\s]+/g, "");

  const priorityClass = ticket.priority?.toLowerCase();

  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <span className={styles.ticketId}>Ticket #{ticket.id}</span>

        <span className={`${styles.status} ${styles[statusClass] || ""}`}>
          {ticket.status}
        </span>
      </div>

      <Link href={`/tickets/${ticket.id}`} className={styles.title}>
        {ticket.title}
      </Link>

      <p className={styles.description}>{ticket.description}</p>

      <div className={styles.details}>
        <div className={styles.labels}>
          <span className={`${styles.priority} ${styles[priorityClass] || ""}`}>
            <span className={styles.priorityDot} />
            {ticket.priority}
          </span>

          {ticket.category && (
            <span className={styles.category}>{ticket.category}</span>
          )}
        </div>

        <span className={styles.date}>{formatDate(ticket.createdAt)}</span>
      </div>

      <div className={styles.footer}>
        <div>
          <span className={styles.footerLabel}>
            {ticket.assignedTo ? "Assigned to" : "Assigned"}
          </span>

          <span className={styles.footerValue}>
            {ticket.assignedTo?.name || "Unassigned"}
          </span>
        </div>

        <Link href={`/tickets/${ticket.id}`} className={styles.viewLink}>
          View ticket →
        </Link>
      </div>
    </article>
  );
}
