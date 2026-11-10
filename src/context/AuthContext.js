"use client";

import { createContext, useCallback, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const refreshUser = useCallback(async ({ signal } = {}) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error("Unable to verify your session.");
      }

      const data = await response.json();
      const currentUser = data.user ?? null;

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      if (error.name === "AbortError") return null;

      console.error("Authentication error:", error);

      setUser(null);
      setAuthError(error.message);

      return null;
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const role = user?.role ?? "guest";
  const isAuthenticated = Boolean(user);

  const setAuthenticatedUser = useCallback((userData) => {
    setUser(userData);
    setAuthError(null);
    setIsLoading(false);
  }, []);

  const clearAuthenticatedUser = useCallback(() => {
    setUser(null);
    setAuthError(null);
    setIsLoading(false);
  }, []);

  const hasRole = useCallback((requiredRole) => role === requiredRole, [role]);

  const contextValue = useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      isLoading,
      authError,
      refreshUser,
      setAuthenticatedUser,
      clearAuthenticatedUser,
      hasRole,
    }),
    [
      user,
      role,
      isAuthenticated,
      isLoading,
      authError,
      refreshUser,
      setAuthenticatedUser,
      clearAuthenticatedUser,
      hasRole,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
