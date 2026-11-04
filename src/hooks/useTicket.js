"use client";

import { useContext, useCallback, useMemo } from "react";

import { TicketContext } from "@/context/TicketContext";

export function useTicket() {
  const context = useContext(TicketContext);

  if (!context) {
    throw new Error("useTicket must be used within TicketContextProvider");
  }

  const { state, dispatch } = context;
  const { tickets, isLoading, error } = state;

  // Normalize status values
  const normalizeStatus = (status) =>
    String(status ?? "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

  // Replace all tickets
  const setTickets = useCallback(
    (tickets) => {
      dispatch({
        type: "SET_TICKETS",
        payload: tickets,
      });
    },
    [dispatch],
  );

  // Add a new ticket
  const addTicket = useCallback(
    (ticket) => {
      dispatch({
        type: "ADD_TICKET",
        payload: ticket,
      });
    },
    [dispatch],
  );

  // Update an existing ticket
  const updateTicket = useCallback(
    (ticketId, updates) => {
      dispatch({
        type: "UPDATE_TICKET",
        payload: { ticketId, updates },
      });
    },
    [dispatch],
  );

  // Remove a ticket
  const removeTicket = useCallback(
    (ticketId) => {
      dispatch({
        type: "REMOVE_TICKET",
        payload: ticketId,
      });
    },
    [dispatch],
  );

  // Set loading state
  const setLoading = useCallback(
    (value) => {
      dispatch({
        type: "SET_LOADING",
        payload: value,
      });
    },
    [dispatch],
  );

  // Set error state
  const setError = useCallback(
    (error) => {
      dispatch({
        type: "SET_ERROR",
        payload: error,
      });
    },
    [dispatch],
  );

  // Get tickets belonging to a specific user
  const getUserTickets = useCallback(
    (userId) => {
      if (!userId) return [];

      return tickets.filter(
        (ticket) => String(ticket.userId) === String(userId),
      );
    },
    [tickets],
  );

  // Get all unresolved tickets belonging to a user
  const getActiveTickets = useCallback(
    (userId) => {
      return getUserTickets(userId).filter((ticket) => {
        const status = String(ticket.status ?? "")
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-");

        return ["open", "in-progress", "pending"].includes(status);
      });
    },
    [getUserTickets],
  );

  // Filter user tickets by status
  const getTicketsByStatus = useCallback(
    (userId, status) => {
      const userTickets = getUserTickets(userId);

      if (status === "all") return userTickets;

      return userTickets.filter(
        (ticket) => normalizeStatus(ticket.status) === normalizeStatus(status),
      );
    },
    [getUserTickets],
  );

  // Calculate user ticket statistics
  const getTicketStatistics = useCallback(
    (userId) => {
      const userTickets = getUserTickets(userId);

      const resolved = userTickets.filter(
        (ticket) => normalizeStatus(ticket.status) === "resolved",
      );

      const pending = userTickets.filter((ticket) =>
        ["open", "in-progress", "pending"].includes(
          normalizeStatus(ticket.status),
        ),
      );

      return {
        total: userTickets.length,
        resolved: resolved.length,
        pending: pending.length,
      };
    },
    [getUserTickets],
  );

  // Get tickets assigned to a specific agent
  const getAssignedTickets = useCallback(
    (agentId) => {
      if (!agentId) return [];

      return tickets
        .filter((ticket) => String(ticket.assignedTo) === String(agentId))
        .sort(
          (a, b) =>
            new Date(b.updatedAt ?? b.createdAt ?? 0) -
            new Date(a.updatedAt ?? a.createdAt ?? 0),
        );
    },
    [tickets],
  );

  // Calculate agent statistics
  const getAgentTicketStatistics = useCallback(
    (agentId) => {
      const assignedTickets = getAssignedTickets(agentId);

      const getCount = (status) =>
        assignedTickets.filter(
          (ticket) => normalizeStatus(ticket.status) === status,
        ).length;

      return {
        total: assignedTickets.length,
        open: getCount("open"),
        inProgress: getCount("in-progress"),
        pending: getCount("pending"),
        resolved: getCount("resolved"),
        active:
          getCount("open") + getCount("in-progress") + getCount("pending"),
      };
    },
    [getAssignedTickets],
  );

  // Calculate system-wide ticket statistics
  const getAllTicketStatistics = useCallback(() => {
    const getCount = (status) =>
      tickets.filter((ticket) => normalizeStatus(ticket.status) === status)
        .length;

    return {
      total: tickets.length,
      open: getCount("open"),
      inProgress: getCount("in-progress"),
      pending: getCount("pending"),
      resolved: getCount("resolved"),
    };
  }, [tickets]);

  // Get most recently created or updated tickets
  const getRecentTickets = useCallback(
    (limit = 5) => {
      return [...tickets]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, limit);
    },
    [tickets],
  );

  // Filter any ticket collection by status and search query
const filterTicketList = useCallback(
  (sourceTickets = [], { status = "all", search = "" } = {}) => {
    const normalizedSearch = search.trim().toLowerCase();

    return sourceTickets.filter((ticket) => {
      const ticketStatus = normalizeStatus(ticket.status);

      const matchesStatus =
        status === "all" ||
        ticketStatus === normalizeStatus(status);

      const searchableText = [
        ticket.title,
        ticket.description,
        ticket.ticketNumber,
        ticket.priority,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  },
  []
);

  return useMemo(
    () => ({
      tickets,
      isLoading,
      error,

      setTickets,
      addTicket,
      updateTicket,
      removeTicket,
      setLoading,
      setError,
      getUserTickets,
      getActiveTickets,
      getTicketsByStatus,
      getTicketStatistics,
      getAssignedTickets,
      getAgentTicketStatistics,
      getAllTicketStatistics,
      getRecentTickets,
      filterTicketList,
    }),
    [
      tickets,
      isLoading,
      error,
      setTickets,
      addTicket,
      updateTicket,
      removeTicket,
      setLoading,
      setError,
      getUserTickets,
      getActiveTickets,
      getTicketsByStatus,
      getTicketStatistics,
      getAssignedTickets,
      getAgentTicketStatistics,
      getAllTicketStatistics,
      getRecentTickets,
      filterTicketList,
    ],
  );
}
