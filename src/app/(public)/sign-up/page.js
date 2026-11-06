import Form from "@/components/form/Form";
import GuestOnly from "@/components/auth/GuestOnly";

import { signUp } from "@/lib/actions/auth-actions";

export default function SignUpPage() {
  const headerTitle = "Create an Account";

  const headerMessage =
    "Join SupportDesk and manage your support requests easily.";

  const submitMessage = "Create Account";

  const formElements = [
    {
      id: "name",
      title: "Full Name",
      name: "name",
      type: "text",
      placeholder: "Enter your full name",
      autoComplete: "name",
    },
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
      autoComplete: "new-password",
    },
  ];

  return (
    <GuestOnly>
      <Form
        headerTitle={headerTitle}
        headerMessage={headerMessage}
        formElements={formElements}
        submitMessage={submitMessage}
        action={signUp}
        footerText="Already have an account?"
        footerHref="/login"
        footerLabel="Sign in"
      />
    </GuestOnly>
  );
}
