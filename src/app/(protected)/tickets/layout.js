import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";

export default async function TicketsLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/admin/tickets");
  }

  if (user.role === "agent") {
    redirect("/assigned-tickets");
  }

  return (
    <Suspense fallback={<p>Loading Tickets page...</p>}>{children}</Suspense>
  );
}
