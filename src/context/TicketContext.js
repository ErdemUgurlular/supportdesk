
"use client";

import {
  createContext,
  useReducer,
  useMemo,
} from "react";

export const TicketContext = createContext(null);

const initialState = {
  tickets: [],
  isLoading: false,
  error: null,
};

function ticketReducer(state, action) {
  switch (action.type) {
    case "SET_TICKETS":
      return {
        ...state,
        tickets: action.payload,
      };

    case "ADD_TICKET":
      return {
        ...state,
        tickets: [...state.tickets, action.payload],
      };

    case "UPDATE_TICKET":
      return {
        ...state,
        tickets: state.tickets.map((ticket) =>
          String(ticket._id ?? ticket.id) ===
          String(action.payload.ticketId)
            ? { ...ticket, ...action.payload.updates }
            : ticket
        ),
      };

    case "REMOVE_TICKET":
      return {
        ...state,
        tickets: state.tickets.filter(
          (ticket) =>
            String(ticket._id ?? ticket.id) !==
            String(action.payload)
        ),
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}

export function TicketContextProvider({ children }) {
  const [state, dispatch] = useReducer(
    ticketReducer,
    initialState
  );

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  return (
    <TicketContext.Provider value={contextValue}>
      {children}
    </TicketContext.Provider>
  );
}
