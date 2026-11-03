
import "server-only";

import { cache } from "react";

const dummyUsers = {
  user: {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
  },

  agent: {
    id: "agent-123",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "agent",
  },

  admin: {
    id: "admin-123",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
};

export const getCurrentUser = cache(async () => {
  // Never use dummy authentication in production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const role = process.env.DUMMY_USER_ROLE || "user";

  // Guests are unauthenticated
  if (role === "guest") {
    return null;
  }

  const user = dummyUsers[role];

  if (!user) {
    throw new Error(
      `Invalid DUMMY_USER_ROLE: ${role}. Use user, agent, admin, or guest.`
    );
  }

  return user;
});
