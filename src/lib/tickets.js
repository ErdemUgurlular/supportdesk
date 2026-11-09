import "server-only";

import pool from "@/lib/db";

const PAGE_SIZE = 10;

const STATUSES = ["open", "in_progress", "resolved", "closed"];

const PRIORITIES = ["low", "medium", "high", "urgent"];

// Only predefined SQL expressions are allowed here.
// Never insert user-provided sort values into SQL.
const SORT_OPTIONS = {
  newest: "t.created_at DESC, t.id DESC",
  oldest: "t.created_at ASC, t.id ASC",

  priorityHigh: `
    CASE t.priority
      WHEN 'urgent' THEN 4
      WHEN 'high' THEN 3
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 1
      ELSE 0
    END DESC,
    t.created_at DESC
  `,

  priorityLow: `
    CASE t.priority
      WHEN 'low' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'high' THEN 3
      WHEN 'urgent' THEN 4
      ELSE 0
    END ASC,
    t.created_at DESC
  `,
};

function getSingleValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeFilter(value) {
  return String(getSingleValue(value) ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export async function getTickets({
  userId,
  role,
  mode = "all",
  page = 1,
  search = "",
  status = "All",
  priority = "All",
  sort = "newest",
  paginate = true,
}) {
  // =========================================
  // 1. AUTHORIZATION
  // =========================================

  if (!userId || !["user", "agent", "admin"].includes(role)) {
    throw new Error("Unauthorized");
  }

  const conditions = [];
  const values = [];

  function addParameter(value) {
    values.push(value);
    return `$${values.length}`;
  }

  if (mode === "mine") {
    if (role !== "user") {
      throw new Error("Unauthorized");
    }

    conditions.push(`t.user_id = ${addParameter(userId)}`);
  } else if (mode === "assigned") {
    if (role !== "agent") {
      throw new Error("Unauthorized");
    }

    conditions.push(`t.assigned_to = ${addParameter(userId)}`);
  } else if (mode === "all") {
    if (role !== "admin") {
      throw new Error("Unauthorized");
    }
  } else {
    throw new Error("Invalid ticket mode");
  }

  // =========================================
  // 2. STATUS FILTER
  // =========================================

  const normalizedStatus = normalizeFilter(status);

  if (normalizedStatus && normalizedStatus !== "all") {
    if (!STATUSES.includes(normalizedStatus)) {
      throw new Error("Invalid ticket status");
    }

    conditions.push(`t.status = ${addParameter(normalizedStatus)}`);
  }

  // =========================================
  // 3. PRIORITY FILTER
  // =========================================

  let normalizedPriority = normalizeFilter(priority);

  // Backward compatibility with the old UI value.
  if (normalizedPriority === "critical") {
    normalizedPriority = "urgent";
  }

  if (normalizedPriority && normalizedPriority !== "all") {
    if (!PRIORITIES.includes(normalizedPriority)) {
      throw new Error("Invalid ticket priority");
    }

    conditions.push(`t.priority = ${addParameter(normalizedPriority)}`);
  }

  // =========================================
  // 4. SEARCH
  // =========================================

  const searchTerm = String(getSingleValue(search) ?? "")
    .trim()
    .slice(0, 100);

  if (searchTerm) {
    const searchParameter = addParameter(`%${searchTerm}%`);

    const searchConditions = [
      `t.title ILIKE ${searchParameter}`,
      `t.description ILIKE ${searchParameter}`,
    ];

    if (/^\d+$/.test(searchTerm)) {
      const idParameter = addParameter(searchTerm);

      searchConditions.push(`t.id::text = ${idParameter}`);
    }

    conditions.push(`(${searchConditions.join(" OR ")})`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // =========================================
  // 5. PAGINATION
  // =========================================

  const requestedPage = Math.max(
    1,
    Math.min(1000000, Number.parseInt(getSingleValue(page), 10) || 1),
  );

  // =========================================
  // 6. SORTING
  // =========================================

  const sortKey = getSingleValue(sort);

  const orderBy = SORT_OPTIONS[sortKey] ?? SORT_OPTIONS.newest;

  // =========================================
  // 7. TOTAL COUNT
  // =========================================

  const countResult = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM public.tickets t
      ${whereClause}
    `,
    values,
  );

  const totalTickets = Number(countResult.rows[0].total);

  const totalPages = paginate
    ? Math.max(1, Math.ceil(totalTickets / PAGE_SIZE))
    : 1;

  const currentPage = paginate ? Math.min(requestedPage, totalPages) : 1;

  const offset = (currentPage - 1) * PAGE_SIZE;

  // =========================================
  // 8. RETRIEVE TICKETS
  // =========================================

  let paginationClause = "";

  if (paginate) {
    const limitParameter = addParameter(PAGE_SIZE);
    const offsetParameter = addParameter(offset);

    paginationClause = `
    LIMIT ${limitParameter}
    OFFSET ${offsetParameter}
  `;
  }

  const result = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,

        t.user_id AS "userId",
        t.assigned_to AS "assignedToId",

        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",

        creator.full_name AS "createdByName",

        assigned.id AS "assignedUserId",
        assigned.full_name AS "assignedToName"

      FROM public.tickets t

      INNER JOIN public.users creator
        ON creator.id = t.user_id

      LEFT JOIN public.users assigned
        ON assigned.id = t.assigned_to

      ${whereClause}

      ORDER BY ${orderBy}

      ${paginationClause} 
    `,
    values,
  );

  // =========================================
  // 9. MAP DATABASE RESULTS
  // =========================================

  const tickets = result.rows.map((ticket) => ({
    id: ticket.id,

    title: ticket.title,
    description: ticket.description,

    status: ticket.status,
    priority: ticket.priority,

    userId: ticket.userId,

    createdBy: {
      id: ticket.userId,
      name: ticket.createdByName,
    },

    assignedToId: ticket.assignedToId,

    assignedTo: ticket.assignedUserId
      ? {
          id: ticket.assignedUserId,
          name: ticket.assignedToName,
        }
      : null,

    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  }));

  return {
    tickets,
    totalTickets,
    currentPage,
    totalPages,
    pageSize: paginate ? PAGE_SIZE : totalTickets,
  };
}
