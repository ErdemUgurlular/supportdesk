"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/actions/auth-actions";

export default function LogoutButton({ className }) {
  const router = useRouter();

  const { clearAuthenticatedUser } = useAuth();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await signOut();

      clearAuthenticatedUser();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? "Signing out..." : "Logout"}
    </button>
  );
}
