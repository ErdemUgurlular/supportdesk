"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export default function GuestOnly({ children }) {
  const router = useRouter();

  const { isAuthenticated, isLoading, authError, refreshUser } = useAuth();

  // Redirect authenticated users away from public authentication pages.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  // Wait for session validation.
  if (isLoading || isAuthenticated) {
    return (
      <main aria-live="polite">
        <p>Checking your session...</p>
      </main>
    );
  }

  // Do not mistake a failed authentication check for a guest session.
  if (authError) {
    return (
      <main>
        <h2>Unable to verify your session.</h2>
        <button type="button" onClick={() => refreshUser()}>
          Try Again
        </button>
      </main>
    );
  }

  // Render the public page for guests.
  return children;
}
