import { NextResponse } from "next/server";

import { getTicketsForCurrentUser } from "@/lib/tickets-for-current-user";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const data = await getTicketsForCurrentUser({
      page: searchParams.get("page") ?? 1,
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "All",
      priority: searchParams.get("priority") ?? "All",
      sort: searchParams.get("sort") ?? "newest",
    });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/tickets:", error);

    const message = error.message;

    if (message === "Unauthorized") {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (message === "Forbidden") {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }

    if (
      message === "Invalid ticket status" ||
      message === "Invalid ticket priority" ||
      message === "Invalid ticket mode"
    ) {
      return NextResponse.json(
        { message: "Invalid ticket filters." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Unable to retrieve tickets." },
      { status: 500 },
    );
  }
}
