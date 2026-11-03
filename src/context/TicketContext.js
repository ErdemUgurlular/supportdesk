
"use client";

import { createContext, useContext, useMemo, useState } from "react";

const TicketContext = createContext(null);

export function TicketContextProvider({ children }) {
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    search: "",
  });

  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const contextValue = useMemo(
    () => ({
      filters,
      setFilters,
      selectedTicketId,
      setSelectedTicketId,
    }),
    [filters, selectedTicketId]
  );

  return (
    <TicketContext.Provider value={contextValue}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTicketContext() {
  const context = useContext(TicketContext);

  if (!context) {
    throw new Error(
      "useTicketContext must be used within TicketContextProvider"
    );
  }

  return context;
}
