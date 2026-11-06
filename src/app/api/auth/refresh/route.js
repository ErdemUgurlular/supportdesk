import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

import { jwtVerify } from "jose";

import pool from "@/lib/db";
import { getSessionSecret } from "@/lib/auth";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_TTL_SECONDS,
  REFRESH_TTL_SECONDS,
  signAccessToken,
  hashRefreshToken,
} from "@/lib/auth";

const EARLY_REFRESH_SECONDS = 5 * 60;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

function clearAuthCookies(response) {
  response.cookies.set(ACCESS_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });

  response.cookies.set(REFRESH_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });
}

export async function POST() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  // =========================================
  // 1. CHECK ACCESS TOKEN EXPIRATION
  // =========================================

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        getSessionSecret(),
        { algorithms: ["HS256"] },
      );

      const now = Math.floor(Date.now() / 1000);
      const remainingTime = payload.exp - now;

      // More than 5 minutes remaining.
      // No need to refresh yet.
      if (remainingTime > EARLY_REFRESH_SECONDS) {
        return NextResponse.json({
          success: true,
          refreshed: false,
        });
      }
    } catch {
      // Access token expired or invalid.
      // Continue with refresh token validation.
    }
  }

  // =========================================
  // 2. VALIDATE REFRESH TOKEN
  // =========================================

  if (!refreshToken) {
    const response = NextResponse.json(
      { success: false, message: "Refresh token missing." },
      { status: 401 },
    );

    clearAuthCookies(response);
    return response;
  }

  const oldRefreshHash = hashRefreshToken(refreshToken);

  const client = await pool.connect();

  let session;

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        SELECT
          s.id,
          s.user_id,
          s.absolute_expires_at
        FROM public.user_sessions s
        JOIN public.users u ON u.id = s.user_id
        WHERE s.refresh_token_hash = $1
          AND s.revoked_at IS NULL
          AND s.expires_at > CURRENT_TIMESTAMP
          AND s.absolute_expires_at > CURRENT_TIMESTAMP
          AND u.account_status = 'approved'
        FOR UPDATE OF s
      `,
      [oldRefreshHash],
    );

    session = result.rows[0];

    if (!session) {
      // Revoke an unusable session, if it still exists.
      await client.query(
        `
          UPDATE public.user_sessions
          SET revoked_at = CURRENT_TIMESTAMP
          WHERE refresh_token_hash = $1
            AND revoked_at IS NULL
        `,
        [oldRefreshHash],
      );

      await client.query("COMMIT");
    } else {
      // =========================================
      // 3. ROTATE REFRESH TOKEN
      // =========================================

      const newRefreshToken = randomBytes(32).toString("base64url");

      const newRefreshHash = hashRefreshToken(newRefreshToken);

      await client.query(
        `
          UPDATE public.user_sessions
          SET
            refresh_token_hash = $1,
            last_used_at = CURRENT_TIMESTAMP,
            expires_at = LEAST(
              CURRENT_TIMESTAMP + INTERVAL '7 days',
              absolute_expires_at
            )
          WHERE id = $2
        `,
        [newRefreshHash, session.id],
      );

      await client.query("COMMIT");

      session = {
        ...session,
        newRefreshToken,
      };
    }
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Session refresh error:", error);

    return NextResponse.json(
      { success: false, message: "Session refresh failed." },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  // =========================================
  // 4. HANDLE INVALID SESSION
  // =========================================

  if (!session) {
    const response = NextResponse.json(
      { success: false, message: "Session expired." },
      { status: 401 },
    );

    clearAuthCookies(response);
    return response;
  }

  // =========================================
  // 5. ISSUE NEW ACCESS TOKEN
  // =========================================

  const newAccessToken = await signAccessToken(session.user_id, session.id);

  const remainingAbsoluteSeconds = Math.floor(
    (new Date(session.absolute_expires_at).getTime() - Date.now()) / 1000,
  );

  const refreshCookieAge = Math.min(
    REFRESH_TTL_SECONDS,
    remainingAbsoluteSeconds,
  );

  // =========================================
  // 6. UPDATE COOKIES
  // =========================================

  const response = NextResponse.json({
    success: true,
    refreshed: true,
  });

  response.headers.set("Cache-Control", "no-store");

  response.cookies.set(ACCESS_COOKIE, newAccessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TTL_SECONDS,
  });

  response.cookies.set(REFRESH_COOKIE, session.newRefreshToken, {
    ...cookieOptions,
    maxAge: refreshCookieAge,
  });

  return response;
}
