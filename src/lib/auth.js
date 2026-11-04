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
  const role = (
    process.env.DUMMY_USER_ROLE ?? "guest"
  ).trim().toLowerCase();

  console.log("Dummy authentication role:", role);

  if (role === "guest") {
    return null;
  }

  const user = dummyUsers[role];

  if (!user) {
    throw new Error(`Invalid dummy role: ${role}`);
  }

  return user;
});