import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { createHash, randomBytes, randomUUID } from "node:crypto";

import pool from "@/lib/db";

// =========================================
// CONFIGURATION
// =========================================

export const ACCESS_COOKIE = "supportdesk_access";
export const REFRESH_COOKIE = "supportdesk_refresh";

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;
export const ABSOLUTE_TTL_SECONDS = 30 * 24 * 60 * 60;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

// =========================================
// TOKEN UTILITIES
// =========================================

export function hashRefreshToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function signAccessToken(userId, sessionId) {
  return new SignJWT({
    sid: sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(getSessionSecret());
}

// =========================================
// CREATE SESSION
// =========================================

export async function createSession(userId) {
  const sessionId = randomUUID();

  const refreshToken = randomBytes(32).toString("base64url");
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await pool.query(
    `
      INSERT INTO public.user_sessions (
        id,
        user_id,
        refresh_token_hash,
        expires_at,
        absolute_expires_at
      )
      VALUES (
        $1,
        $2,
        $3,
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '30 days'
      )
    `,
    [sessionId, userId, refreshTokenHash],
  );

  const accessToken = await signAccessToken(userId, sessionId);

  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TTL_SECONDS,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TTL_SECONDS,
  });
}

// =========================================
// DELETE SESSION
// =========================================

export async function deleteSession() {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await pool.query(
      `
        UPDATE public.user_sessions
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE refresh_token_hash = $1
          AND revoked_at IS NULL
      `,
      [hashRefreshToken(refreshToken)],
    );
  } else {
    // Fallback: identify session through access JWT.
    const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, getSessionSecret(), {
          algorithms: ["HS256"],
        });

        if (payload.sid) {
          await pool.query(
            `
              UPDATE public.user_sessions
              SET revoked_at = CURRENT_TIMESTAMP
              WHERE id = $1
                AND revoked_at IS NULL
            `,
            [payload.sid],
          );
        }
      } catch {
        // Invalid or expired access token.
      }
    }
  }

  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

// =========================================
// GET SESSION USER
// =========================================

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  // -----------------------------------------
  // 1. Try access JWT
  // -----------------------------------------

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, getSessionSecret(), {
        algorithms: ["HS256"],
      });

      if (payload.sub && payload.sid) {
        const result = await pool.query(
          `
            SELECT
              u.id,
              u.full_name,
              u.email,
              u.role,
              u.account_status
            FROM public.user_sessions s
            JOIN public.users u ON u.id = s.user_id
            WHERE s.id = $1
              AND s.user_id = $2
              AND s.revoked_at IS NULL
              AND s.expires_at > CURRENT_TIMESTAMP
              AND s.absolute_expires_at > CURRENT_TIMESTAMP
              AND u.account_status = 'approved'
            LIMIT 1
          `,
          [payload.sid, payload.sub],
        );

        if (result.rows[0]) {
          return {
            id: result.rows[0].id,
            name: result.rows[0].full_name,
            email: result.rows[0].email,
            role: result.rows[0].role,
          };
        }
      }
    } catch {
      // Access JWT expired or invalid.
      // Try the refresh token below.
    }
  }

  // -----------------------------------------
  // 2. Fallback to refresh token
  // -----------------------------------------

  if (!refreshToken) {
    return null;
  }

  const result = await pool.query(
    `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role
      FROM public.user_sessions s
      JOIN public.users u ON u.id = s.user_id
      WHERE s.refresh_token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > CURRENT_TIMESTAMP
        AND s.absolute_expires_at > CURRENT_TIMESTAMP
        AND u.account_status = 'approved'
      LIMIT 1
    `,
    [hashRefreshToken(refreshToken)],
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
