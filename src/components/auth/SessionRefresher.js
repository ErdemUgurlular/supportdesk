"use client";

import { useEffect } from "react";

const REFRESH_INTERVAL = 10 * 60 * 1000;

export default function SessionRefresher() {
  useEffect(() => {
    let refreshing = false;

    async function refreshRequest() {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Session refresh request failed.");
      }
    }

    async function refreshSession() {
      if (refreshing || document.visibilityState !== "visible") {
        return;
      }

      refreshing = true;

      try {
        // Coordinate refresh requests across browser tabs.
        if (navigator.locks?.request) {
          await navigator.locks.request(
            "supportdesk-session-refresh",
            refreshRequest,
          );
        } else {
          // Fallback for browsers without Web Locks support.
          await refreshRequest();
        }
      } catch (error) {
        console.error("Session refresh error:", error);
      } finally {
        refreshing = false;
      }
    }

    refreshSession();

    const interval = window.setInterval(refreshSession, REFRESH_INTERVAL);

    document.addEventListener("visibilitychange", refreshSession);

    return () => {
      window.clearInterval(interval);

      document.removeEventListener("visibilitychange", refreshSession);
    };
  }, []);

  return null;
}
