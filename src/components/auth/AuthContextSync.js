"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthContextSync({ user }) {
  const { setAuthenticatedUser } = useAuth();

  useEffect(() => {
    setAuthenticatedUser(user);
  }, [user, setAuthenticatedUser]);

  return null;
}