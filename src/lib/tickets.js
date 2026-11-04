import "server-only";

import prisma from "@/lib/prisma";

const PAGE_SIZE = 10;

const SORT_OPTIONS = {
  newest: [{ createdAt: "desc" }, { id: "desc" }],
  oldest: [{ createdAt: "asc" }, { id: "asc" }],
  priorityHigh: [{ priority: "desc" }, { createdAt: "desc" }],
  priorityLow: [{ priority: "asc" }, { createdAt: "desc" }],
};

export async function getTickets({
  userId,
  role,
  mode = "all",
  page = 1,
  search = "",
  status = "All",
  priority = "All",
  sort = "newest",
}) {
  if (!userId || !["user", "agent", "admin"].includes(role)) {
    throw new Error("Unauthorized");
  }

  // Enforce role-based access on the server.
  const where = {};

  if (mode === "mine") {
    if (role !== "user") {
      throw new Error("Unauthorized");
    }

    where.createdById = userId;
  } else if (mode === "assigned") {
    if (role !== "agent") {
      throw new Error("Unauthorized");
    }

    where.assignedToId = userId;
  } else if (mode === "all") {
    if (!["admin", "agent"].includes(role)) {
      throw new Error("Unauthorized");
    }
  } else {
    throw new Error("Invalid ticket mode");
  }

  // Status filter.
  if (status !== "All") {
    where.status = status;
  }

  // Priority filter.
  if (priority !== "All") {
    where.priority = priority;
  }

  // Search filter.
  const searchTerm = search.trim();

  if (searchTerm) {
    const searchConditions = [
      {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];

    // Also search by numeric ticket ID.
    if (/^\d+$/.test(searchTerm)) {
      searchConditions.push({
        id: Number(searchTerm),
      });
    }

    where.AND = [...(where.AND || []), { OR: searchConditions }];
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const orderBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  const [tickets, totalTickets] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    totalTickets,
    currentPage,
    totalPages: Math.ceil(totalTickets / PAGE_SIZE),
    pageSize: PAGE_SIZE,
  };
}
