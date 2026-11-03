import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import MyTickets from "@/components/dashboard/MyTickets";

export default async function TicketsPage() {
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  switch (user.role) {
    case "user":
      return <MyTickets mode="mine" />;

    case "agent":
    case "admin":
      return <MyTickets mode="all" />;

    default:
      notFound();
  }
}