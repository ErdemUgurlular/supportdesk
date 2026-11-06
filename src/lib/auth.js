
import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import pool from "@/lib/db";

const COOKIE_NAME = "supportdesk_session";
const SESSION_DURATION = 60 * 60 * 24 ; // 1 day

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

// Create a session after successful login
export async function createSession(userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

// Delete the current session
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Retrieve the currently authenticated user
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  let payload;

  try {
    const verified = await jwtVerify(
      token,
      getSessionSecret(),
      { algorithms: ["HS256"] }
    );

    payload = verified.payload;
  } catch {
    return null;
  }

  if (!payload.sub) {
    return null;
  }

  // Always retrieve current account information from PostgreSQL.
  // This also detects accounts that have been rejected or disabled.
  const result = await pool.query(
    `
      SELECT
        id,
        full_name,
        email,
        role,
        account_status
      FROM public.users
      WHERE id = $1
        AND account_status = 'approved'
      LIMIT 1
    `,
    [payload.sub]
  );

  const user = result.rows[0];

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
  };
});
