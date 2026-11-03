"use server";

export async function signUp(previousState, formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    return {
      message: "Please fill in all required fields.",
    };
  }

  if (password.length < 8) {
    return {
      message: "Password must contain at least 8 characters.",
    };
  }

  // TODO:
  // Validate the email, hash the password,
  // and create the user in DB.

  return {
    message:
      "Sign-up action executed successfully. Database registration is not implemented yet.",
  };
}

export async function signIn(previousState, formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return {
      message: "Please enter your email and password.",
    };
  }

  // TODO:
  // 1. Find the user in DB.
  // 2. Verify the password hash.
  // 3. Create a secure authentication session.
  // 4. Set the session cookie.
  // 5. Redirect to /dashboard.

  return {
    message: "Authentication has not been implemented yet.",
  };
}

