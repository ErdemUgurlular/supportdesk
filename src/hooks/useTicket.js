"use client";

import { useContext, useCallback, useMemo } from "react";

import { TicketContext } from "@/context/TicketContext";

export function useTicket() {
  const context = useContext(TicketContext);

  if (!context) {
    throw new Error("useTicket must be used within TicketContextProvider");
  }

  const { state, dispatch } = context;

  const { tickets, isLoading, error, scopeKey } = state;

  // Normalize PostgreSQL status values.
  const normalizeStatus = (status) =>
    String(status ?? "")
      .toLowerCase()
      .trim()
      .replace(/[_\s]+/g, "-");

  // Replace currently loaded tickets.
  const setTickets = useCallback(
    (tickets, scopeKey = null) => {
      dispatch({
        type: "SET_TICKETS",
        payload: {
          tickets,
          scopeKey,
        },
      });
    },
    [dispatch],
  );

  // Add a new ticket.
  const addTicket = useCallback(
    (ticket) => {
      dispatch({
        type: "ADD_TICKET",
        payload: ticket,
      });
    },
    [dispatch],
  );

  // Update a ticket.
  const updateTicket = useCallback(
    (ticketId, updates) => {
      dispatch({
        type: "UPDATE_TICKET",
        payload: { ticketId, updates },
      });
    },
    [dispatch],
  );

  // Remove a ticket.
  const removeTicket = useCallback(
    (ticketId) => {
      dispatch({
        type: "REMOVE_TICKET",
        payload: ticketId,
      });
    },
    [dispatch],
  );

  // Loading state.
  const setLoading = useCallback(
    (value) => {
      dispatch({
        type: "SET_LOADING",
        payload: value,
      });
    },
    [dispatch],
  );

  // Error state.
  const setError = useCallback(
    (error) => {
      dispatch({
        type: "SET_ERROR",
        payload: error,
      });
    },
    [dispatch],
  );

  // Clear the current ticket collection.
  const clearTickets = useCallback(() => {
    dispatch({ type: "CLEAR_TICKETS" });
  }, [dispatch]);

  // Get tickets created by a user.
  const getUserTickets = useCallback(
    (userId) => {
      if (!userId) return [];

      return tickets.filter(
        (ticket) => String(ticket.userId) === String(userId),
      );
    },
    [tickets],
  );

  // Get unresolved tickets belonging to a user.
  const getActiveTickets = useCallback(
    (userId) => {
      return getUserTickets(userId).filter((ticket) =>
        ["open", "in-progress"].includes(normalizeStatus(ticket.status)),
      );
    },
    [getUserTickets],
  );

  // Filter tickets by status.
  const getTicketsByStatus = useCallback(
    (userId, status) => {
      const userTickets = getUserTickets(userId);

      if (normalizeStatus(status) === "all") {
        return userTickets;
      }

      return userTickets.filter(
        (ticket) => normalizeStatus(ticket.status) === normalizeStatus(status),
      );
    },
    [getUserTickets],
  );

  // Calculate statistics for a user's loaded tickets.
  const getTicketStatistics = useCallback(
    (userId) => {
      const userTickets = getUserTickets(userId);

      const resolved = userTickets.filter(
        (ticket) => normalizeStatus(ticket.status) === "resolved",
      );

      const active = userTickets.filter((ticket) =>
        ["open", "in-progress"].includes(normalizeStatus(ticket.status)),
      );

      return {
        total: userTickets.length,
        resolved: resolved.length,
        pending: active.length,
        active: active.length,
        closed: userTickets.filter(
          (ticket) => normalizeStatus(ticket.status) === "closed",
        ).length,
      };
    },
    [getUserTickets],
  );

  // Resolve assigned agent ID from PostgreSQL ticket shape.
  const getAssignedAgentId = (ticket) =>
    ticket.assignedToId ?? ticket.assignedTo?.id ?? ticket.assignedTo;

  // Get tickets assigned to an agent.
  const getAssignedTickets = useCallback(
    (agentId) => {
      if (!agentId) return [];

      return tickets
        .filter(
          (ticket) => String(getAssignedAgentId(ticket)) === String(agentId),
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt ?? b.createdAt ?? 0) -
            new Date(a.updatedAt ?? a.createdAt ?? 0),
        );
    },
    [tickets],
  );

  // Calculate agent statistics.
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
        resolved: getCount("resolved"),
        closed: getCount("closed"),
        active: getCount("open") + getCount("in-progress"),
      };
    },
    [getAssignedTickets],
  );

  // Calculate statistics for the currently loaded collection.
  const getAllTicketStatistics = useCallback(() => {
    const getCount = (status) =>
      tickets.filter((ticket) => normalizeStatus(ticket.status) === status)
        .length;

    return {
      total: tickets.length,
      open: getCount("open"),
      inProgress: getCount("in-progress"),
      resolved: getCount("resolved"),
      closed: getCount("closed"),
      active: getCount("open") + getCount("in-progress"),
    };
  }, [tickets]);

  // Get recent tickets.
  const getRecentTickets = useCallback(
    (limit = 5) => {
      return [...tickets]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, limit);
    },
    [tickets],
  );

  // Filter an arbitrary ticket collection.
  const filterTicketList = useCallback(
    (
      sourceTickets = [],
      { status = "all", search = "", priority = "all" } = {},
    ) => {
      const normalizedSearch = search.trim().toLowerCase();

      return sourceTickets.filter((ticket) => {
        const matchesStatus =
          normalizeStatus(status) === "all" ||
          normalizeStatus(ticket.status) === normalizeStatus(status);

        const matchesPriority =
          normalizeStatus(priority) === "all" ||
          normalizeStatus(ticket.priority) === normalizeStatus(priority);

        const searchableText = [
          ticket.title,
          ticket.description,
          ticket.id,
          ticket.priority,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearch || searchableText.includes(normalizedSearch);

        return matchesStatus && matchesPriority && matchesSearch;
      });
    },
    [],
  );

  return useMemo(
    () => ({
      tickets,
      isLoading,
      error,
      scopeKey,

      setTickets,
      addTicket,
      updateTicket,
      removeTicket,
      setLoading,
      setError,
      clearTickets,

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
      scopeKey,
      setTickets,
      addTicket,
      updateTicket,
      removeTicket,
      setLoading,
      setError,
      clearTickets,
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
