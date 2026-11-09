"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useTicket } from "@/hooks/useTicket";

import TicketCard from "./TicketCard";

import styles from "./TicketList.module.css";

const PRIORITY_RANK = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export default function TicketList({ heading, description }) {
  // =========================================
  // 1. TICKET CONTEXT
  // =========================================

  const { tickets, isLoading, error, filterTicketList } = useTicket();

  // =========================================
  // 2. URL STATE
  // =========================================

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();

  const urlSearch = searchParams.get("search") || "";

  const status = searchParams.get("status") || "All";
  const priority = searchParams.get("priority") || "All";
  const sort = searchParams.get("sort") || "newest";

  const [search, setSearch] = useState(urlSearch);

  const [isPending, startTransition] = useTransition();

  // Synchronize search input with browser navigation.
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // =========================================
  // 3. CLIENT-SIDE FILTERING AND SORTING
  // =========================================

  const filteredTickets = useMemo(() => {
    const filtered = filterTicketList(tickets, {
      status,
      priority,
      search,
    });

    return [...filtered].sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0);
      }

      if (sort === "priorityHigh") {
        return (
          (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0)
        );
      }

      if (sort === "priorityLow") {
        return (
          (PRIORITY_RANK[a.priority] ?? 0) - (PRIORITY_RANK[b.priority] ?? 0)
        );
      }

      // Default: newest first.
      return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
    });
  }, [tickets, filterTicketList, status, priority, search, sort]);

  // =========================================
  // 4. UPDATE URL FILTERS
  // =========================================

  function updateFilters(key, value) {
    const params = new URLSearchParams(queryString);

    if (value === "All" || value === "newest" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // We'll use pagination later.
    params.delete("page");

    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  // =========================================
  // 5. SEARCH DEBOUNCE
  // =========================================

  useEffect(() => {
    if (search.trim() === urlSearch) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(queryString);

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      params.delete("page");

      const query = params.toString();

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname);
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, urlSearch, queryString, pathname, router]);

  // =========================================
  // 6. ACTIVE FILTERS
  // =========================================

  const activeFilters =
    Boolean(search.trim()) || status !== "All" || priority !== "All";

  // =========================================
  // 7. RENDER
  // =========================================

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>{heading}</h1>
          <p>{description}</p>
        </div>

        <span className={styles.ticketCount}>{tickets.length} tickets</span>
      </header>

      {/* FILTERS */}

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
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priority}
          onChange={(event) => updateFilters("priority", event.target.value)}
          className={styles.select}
        >
          <option value="All">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
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

      {/* RESULTS */}

      <div className={styles.resultsInfo}>
        <span>
          Showing {filteredTickets.length} of {tickets.length} tickets
        </span>

        {(isPending || isLoading) && <span>Updating...</span>}
      </div>

      {error ? (
        <p className={styles.error}>Unable to load tickets.</p>
      ) : filteredTickets.length > 0 ? (
        <div className={styles.ticketGrid}>
          {filteredTickets.map((ticket) => (
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
    </section>
  );
}
