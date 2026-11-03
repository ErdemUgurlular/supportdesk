import Form from "@/components/form/Form";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const headerTitle = "Login";
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
  const submitMessage = "Login!";

  return (
    <Form headerTitle={headerTitle} formElements={formElements} submitMessage={submitMessage} signUp={login}/>
  );
}
