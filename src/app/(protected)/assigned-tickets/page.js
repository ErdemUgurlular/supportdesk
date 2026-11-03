import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import MyTickets from "@/components/dashboard/MyTickets";

export default async function AssignedTicketsPage() {
  const user = await getCurrentUser();
  let mode = ""

  // Only agents can access this page
  if (!user || user.role !== "agent") {
    notFound();
  } else {
    mode = "assigned"
  }

  return <MyTickets mode={mode} />;
}