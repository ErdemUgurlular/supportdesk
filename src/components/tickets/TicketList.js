"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import TicketCard from "./TicketCard";
import TicketPagination from "./TicketPagination";
import styles from "./TicketList.module.css";

export default function TicketList({
  tickets,
  currentPage,
  totalPages,
  totalTickets,
  heading,
  description,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const status = searchParams.get("status") || "All";
  const priority = searchParams.get("priority") || "All";
  const sort = searchParams.get("sort") || "newest";

  function updateFilters(key, value) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "All" || value === "newest" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  // Debounce search to avoid sending a request on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      params.delete("page");

      if (params.toString() !== searchParams.toString()) {
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, pathname, router, searchParams]);

  const activeFilters =
    searchParams.has("search") || status !== "All" || priority !== "All";

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>{heading}</h1>
          <p>{description}</p>
        </div>

        <span className={styles.ticketCount}>{totalTickets} tickets</span>
      </header>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Search tickets..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={styles.search}
        />

        <select
          value={status}
          onChange={(event) => updateFilters("status", event.target.value)}
          className={styles.select}
        >
          <option value="All">All statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priority}
          onChange={(event) => updateFilters("priority", event.target.value)}
          className={styles.select}
        >
          <option value="All">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <select
          value={sort}
          onChange={(event) => updateFilters("sort", event.target.value)}
          className={styles.select}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priorityHigh">Highest priority</option>
          <option value="priorityLow">Lowest priority</option>
        </select>
      </div>

      <div className={styles.resultsInfo}>
        <span>
          Showing {tickets.length} of {totalTickets} tickets
        </span>

        {isPending && <span>Updating...</span>}
      </div>

      {tickets.length > 0 ? (
        <div className={styles.ticketGrid}>
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>No tickets found</h3>
          <p>
            {activeFilters
              ? "Try changing your search or filters."
              : "There are currently no tickets to display."}
          </p>
        </div>
      )}

      <TicketPagination
        currentPage={currentPage}
        totalPages={totalPages}
        searchParams={Object.fromEntries(searchParams.entries())}
      />
    </section>
  );
}
