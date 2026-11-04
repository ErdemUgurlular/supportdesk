
"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);

  // Get the current user's role.
  // Unauthenticated users have the guest role.
  const role = user?.role ?? "guest";

  // Check authentication status
  const isAuthenticated = Boolean(user);

  // Set user after successful login
  const setAuthenticatedUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Clear user after logout
  const clearAuthenticatedUser = useCallback(() => {
    setUser(null);
  }, []);

  // Check whether the user has a specific role
  const hasRole = useCallback(
    (requiredRole) => role === requiredRole,
    [role]
  );

  const contextValue = useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      setAuthenticatedUser,
      clearAuthenticatedUser,
      hasRole,
    }),
    [
      user,
      role,
      isAuthenticated,
      setAuthenticatedUser,
      clearAuthenticatedUser,
      hasRole,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
