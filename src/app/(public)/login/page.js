import Form from "@/components/form/Form";
import { signIn } from "@/lib/actions/auth-actions";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  const headerTitle = "Welcome Back";

  const headerMessage =
    "Sign in to your SupportDesk account to manage your support requests.";

  const submitMessage = "Sign In";

  const formElements = [
    {
      id: "email",
      title: "Email Address",
      name: "email",
      type: "email",
      placeholder: "Enter your email address",
      autoComplete: "email",
    },
    {
      id: "password",
      title: "Password",
      name: "password",
      type: "password",
      placeholder: "Enter your password",
      autoComplete: "current-password",
    },
  ];

  return (
    <Form
      headerTitle={headerTitle}
      headerMessage={headerMessage}
      formElements={formElements}
      submitMessage={submitMessage}
      action={signIn}
      footerText="Don't have an account?"
      footerHref="/sign-up"
      footerLabel="Create an account"
    />
  );
}
