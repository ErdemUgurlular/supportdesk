
import "server-only";

import { cache } from "react";

// Dummy users for development
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
  // Only enable dummy authentication during development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const role = (
    process.env.DUMMY_USER_ROLE ?? "guest"
  ).trim().toLowerCase();

  // Guest users are not authenticated
  if (role === "guest") {
    return null;
  }

  const user = dummyUsers[role];

  if (!user) {
    throw new Error(
      `Invalid DUMMY_USER_ROLE: ${role}`
    );
  }

  return user;
});
