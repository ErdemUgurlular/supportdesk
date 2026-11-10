"use client";

import { createContext, useReducer, useMemo, useEffect } from "react";

export const TicketContext = createContext(null);

const initialState = {
  tickets: [],
  isLoading: false,
  error: null,
  scopeKey: null,
};

function ticketReducer(state, action) {
  switch (action.type) {
    case "SET_TICKETS": {
      const payload = Array.isArray(action.payload)
        ? { tickets: action.payload, scopeKey: null }
        : action.payload;

      return {
        ...state,
        tickets: payload.tickets,
        scopeKey: payload.scopeKey ?? null,
        isLoading: false,
        error: null,
      };
    }

    case "ADD_TICKET": {
      const newTicket = action.payload;

      const alreadyExists = state.tickets.some(
        (ticket) => String(ticket.id) === String(newTicket.id),
      );

      if (alreadyExists) {
        return state;
      }

      return {
        ...state,
        tickets: [...state.tickets, newTicket],
      };
    }

    case "UPDATE_TICKET": {
      const { ticketId, updates } = action.payload;

      return {
        ...state,
        tickets: state.tickets.map((ticket) =>
          String(ticket.id) === String(ticketId)
            ? { ...ticket, ...updates }
            : ticket,
        ),
      };
    }

    case "REMOVE_TICKET":
      return {
        ...state,
        tickets: state.tickets.filter(
          (ticket) => String(ticket.id) !== String(action.payload),
        ),
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "CLEAR_TICKETS":
      return initialState;

    default:
      return state;
  }
}

export function TicketContextProvider({
  children,
  initialTickets = [],
  scopeKey = null,
}) {
  const [state, dispatch] = useReducer(
    ticketReducer,
    { initialTickets, scopeKey },
    ({ initialTickets, scopeKey }) => ({
      ...initialState,
      tickets: initialTickets,
      scopeKey,
    }),
  );

  // Synchronize if the server supplies updated data.
  useEffect(() => {
    dispatch({
      type: "SET_TICKETS",
      payload: {
        tickets: initialTickets,
        scopeKey,
      },
    });
  }, [initialTickets, scopeKey]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return (
    <TicketContext.Provider value={contextValue}>
      {children}
    </TicketContext.Provider>
  );
}
