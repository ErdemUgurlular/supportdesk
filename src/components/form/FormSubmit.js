"use client";

import { useFormStatus } from "react-dom";

export default function FormSubmit({message}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : message}
    </button>
  );
}
