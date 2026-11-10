import "server-only";
import pool from "@/lib/db";
import { emailMayExist, rememberEmail } from "@/lib/email-bloom";

// Check whether an email already exists.
export async function emailExists(email) {
  const normalizedEmail = email.trim().toLowerCase();

  // Step 1: Bloom Filter check
  const mightExist = await emailMayExist(normalizedEmail);

  // Definitely not in the filter.
  if (!mightExist) {
    return false;
  }

  // Step 2: Exact PostgreSQL check
  const result = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM public.users
        WHERE LOWER(email) = LOWER($1)
      ) AS email_exists
    `,
    [normalizedEmail],
  );

  return result.rows[0].email_exists;
}
// Register a new account.
// Public registration always creates a pending user.
export async function createPendingUser({ fullName, email, passwordHash }) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `
      INSERT INTO public.users (
        full_name,
        email,
        password_hash,
        role,
        account_status
      )
      VALUES ($1, $2, $3, 'user', 'pending')
      RETURNING
        id,
        full_name,
        email,
        role,
        account_status,
        created_at
    `,
    [fullName.trim(), normalizedEmail, passwordHash],
  );

  // Update Bloom Filter after successful registration.
  rememberEmail(normalizedEmail);

  return result.rows[0];
}

// Retrieve an account using its email address.
export async function getUserByEmail(email) {
  const result = await pool.query(
    `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        role,
        account_status
      FROM public.users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email.trim()],
  );

  return result.rows[0] || null;
}
