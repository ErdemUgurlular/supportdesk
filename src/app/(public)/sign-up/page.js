import Form from "@/components/form/Form";
import { signUp } from "@/lib/auth";

export default function SignUpPage() {
  const headerTitle = "Sign Up";
  const headerMessage =
    "Create your account and wait for an admin to confirm it";
  const formElements = [
  {
    title: "Email",
    type: "email",
    id: "email",
    name: "email",
  },
  {
    title: "Password",
    type: "password",
    id: "password",
    name: "password",
  },
];
  const submitMessage = "Sign up!";

  return (
    <Form headerTitle={headerTitle} headerMessage={headerMessage} formElements={formElements} submitMessage={submitMessage} signUp={signUp}/>
  );
}
