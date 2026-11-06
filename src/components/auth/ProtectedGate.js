import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import SessionRefresher from "./SessionRefresher";
import MainNavigation from "@/components/layout/MainNavigation";

export default async function ProtectedGate({ children }) {
  // Wait until an actual request arrives.
  await connection();

  // Request-specific authentication.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <MainNavigation />
      <SessionRefresher />
      {children}
    </>
  );
}
