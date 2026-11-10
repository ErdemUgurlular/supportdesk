import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";
import TicketsPageContent from "@/components/tickets/TicketsPageContent";

export default async function AdminTicketsPage() {
  // Authenticate.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Authorize.
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<p>Loading tickets...</p>}>
      <TicketsPageContent
        heading="All Support Tickets"
        description="View, filter and monitor all SupportDesk tickets."
      />
    </Suspense>
  );
}
