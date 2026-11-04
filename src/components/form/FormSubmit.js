"use client";

import { useFormStatus } from "react-dom";

import styles from "./FormSubmit.module.css";

export default function FormSubmit({ message }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={styles.submitButton}>
      {pending ? "Submitting..." : message}
    </button>
  );
}
