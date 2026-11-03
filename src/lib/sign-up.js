'use server'

export async function signUp(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  console.log(email, password);
  //Database insert needed later !!

  return { message: "Account created successfully!" };
}