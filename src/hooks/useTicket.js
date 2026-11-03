
"use client";

import {
  useContext,
  useCallback,
  useMemo,
} from "react";

import { TicketContext } from "@/context/TicketContext";

export function useTicket() {
  const context = useContext(TicketContext);

  if (!context) {
    throw new Error(
      "useTicket must be used within TicketContextProvider"
    );
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
  const setTickets = useCallback((tickets) => {
    dispatch({
      type: "SET_TICKETS",
      payload: tickets,
    });
  }, [dispatch]);

  // Add a new ticket
  const addTicket = useCallback((ticket) => {
    dispatch({
      type: "ADD_TICKET",
      payload: ticket,
    });
  }, [dispatch]);

  // Update an existing ticket
  const updateTicket = useCallback((ticketId, updates) => {
    dispatch({
      type: "UPDATE_TICKET",
      payload: { ticketId, updates },
    });
  }, [dispatch]);

  // Remove a ticket
  const removeTicket = useCallback((ticketId) => {
    dispatch({
      type: "REMOVE_TICKET",
      payload: ticketId,
    });
  }, [dispatch]);

  // Set loading state
  const setLoading = useCallback((value) => {
    dispatch({
      type: "SET_LOADING",
      payload: value,
    });
  }, [dispatch]);

  // Set error state
  const setError = useCallback((error) => {
    dispatch({
      type: "SET_ERROR",
      payload: error,
    });
  }, [dispatch]);

  // Get tickets belonging to a specific user
  const getUserTickets = useCallback(
    (userId) => {
      if (!userId) return [];

      return tickets.filter(
        (ticket) =>
          String(ticket.userId) === String(userId)
      );
    },
    [tickets]
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
  [getUserTickets]
);

  // Filter user tickets by status
  const getTicketsByStatus = useCallback(
    (userId, status) => {
      const userTickets = getUserTickets(userId);

      if (status === "all") return userTickets;

      return userTickets.filter(
        (ticket) =>
          normalizeStatus(ticket.status) ===
          normalizeStatus(status)
      );
    },
    [getUserTickets]
  );

  // Calculate user ticket statistics
  const getTicketStatistics = useCallback(
    (userId) => {
      const userTickets = getUserTickets(userId);

      const resolved = userTickets.filter(
        (ticket) =>
          normalizeStatus(ticket.status) === "resolved"
      );

      const pending = userTickets.filter((ticket) =>
        ["open", "in-progress", "pending"].includes(
          normalizeStatus(ticket.status)
        )
      );

      return {
        total: userTickets.length,
        resolved: resolved.length,
        pending: pending.length,
      };
    },
    [getUserTickets]
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
    ]
  );
}
