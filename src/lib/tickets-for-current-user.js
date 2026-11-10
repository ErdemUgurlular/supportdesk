import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { getTickets } from "@/lib/tickets";

export async function getTicketsForCurrentUser(filters = {}) {
  // 1. Authenticate the current user.
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 2. Determine the ticket scope from the server-side role.
  const modeByRole = {
    user: "mine",
    agent: "assigned",
    admin: "all",
  };

  const mode = modeByRole[user.role];

  if (!mode) {
    throw new Error("Forbidden");
  }

  // 3. Retrieve tickets using trusted identity information.
  const result = await getTickets({
    ...filters,
    userId: user.id,
    role: user.role,
    mode,
  });

  return result;
}
