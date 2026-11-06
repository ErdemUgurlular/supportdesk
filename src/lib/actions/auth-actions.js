"use server";

import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/auth";
import { createPendingUser, getUserByEmail, emailExists } from "@/lib/users";

// =========================================
// SIGN UP
// =========================================

export async function signUp(previousState, formData) {
  const fullName = String(formData.get("name") ?? "").trim();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  // =========================================
  // VALIDATION
  // =========================================

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (
    !fullName ||
    fullName.length > 100 ||
    !email ||
    email.length > 254 ||
    !validEmail ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return {
      message:
        "Please enter valid registration information. Your password must be at least 8 characters.",
      type: "error",
      user: null,
    };
  }

  try {
    // =========================================
    // BLOOM FILTER + DATABASE CHECK
    // =========================================

    const exists = await emailExists(email);

    if (exists) {
      return {
        message: "An account with this email address already exists.",
        type: "error",
        user: null,
      };
    }

    // =========================================
    // PASSWORD HASHING
    // =========================================

    const passwordHash = await hashPassword(password);

    // =========================================
    // CREATE PENDING USER
    // =========================================

    await createPendingUser({
      fullName,
      email,
      passwordHash,
    });

    return {
      message:
        "Your registration was successful! Your account is now awaiting administrator approval.",
      type: "success",
      user: null,
    };
  } catch (error) {
    // Handle simultaneous registration attempts.
    // PostgreSQL unique index is the final authority.
    if (error.code === "23505") {
      return {
        message: "An account with this email address already exists.",
        type: "error",
        user: null,
      };
    }

    console.error("Sign-up error:", error);

    return {
      message:
        "Something went wrong while creating your account. Please try again.",
      type: "error",
      user: null,
    };
  }
}

// =========================================
// SIGN IN
// =========================================

export async function signIn(previousState, formData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      message: "Please enter your email and password.",
      type: "error",
      user: null,
    };
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return {
        message: "Invalid email or password.",
        type: "error",
        user: null,
      };
    }

    const passwordIsValid = await verifyPassword(password, user.password_hash);

    if (!passwordIsValid) {
      return {
        message: "Invalid email or password.",
        type: "error",
        user: null,
      };
    }

    if (user.account_status === "pending") {
      return {
        message: "Your account is awaiting administrator approval.",
        type: "error",
        user: null,
      };
    }

    if (user.account_status === "rejected") {
      return {
        message:
          "Your registration has been rejected. Please contact an administrator.",
        type: "error",
        user: null,
      };
    }

    if (user.account_status !== "approved") {
      return {
        message: "Your account is currently unavailable.",
        type: "error",
        user: null,
      };
    }

    await createSession(user.id);

    return {
      message: "Login successful!",
      type: "success",
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      message: "Something went wrong. Please try again.",
      type: "error",
      user: null,
    };
  }
}

// =========================================
// SIGN OUT
// =========================================

export async function signOut() {
  await deleteSession();

  return {
    success: true,
  };
}
