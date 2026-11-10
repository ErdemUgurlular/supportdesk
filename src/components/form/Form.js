"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

import FormSubmit from "./FormSubmit";
import styles from "./Form.module.css";

const initialState = {
  message: null,
  type: null,
  user: null,
};

export default function Form({
  headerTitle,
  headerMessage,
  action,
  formElements,
  submitMessage,
  footerText,
  footerHref,
  footerLabel,
}) {
  const router = useRouter();

  const { setAuthenticatedUser } = useAuth();

  const [state, formAction] = useActionState(action, initialState);

  // Synchronize successful login with AuthContext.
  useEffect(() => {
    if (!state.user) {
      return;
    }

    setAuthenticatedUser(state.user);
    router.replace("/dashboard");
  }, [state.user, setAuthenticatedUser, router]);

  return (
    <main className={styles.formPage}>
      <section className={styles.formCard}>
        <header className={styles.formHeader}>
          <h1>{headerTitle}</h1>

          {headerMessage && <p>{headerMessage}</p>}
        </header>

        <form action={formAction} className={styles.form}>
          <div className={styles.formFields}>
            {formElements.map((element) => (
              <div key={element.id} className={styles.formGroup}>
                <label htmlFor={element.id}>{element.title}</label>

                <input
                  type={element.type}
                  id={element.id}
                  name={element.name}
                  placeholder={element.placeholder ?? ""}
                  autoComplete={element.autoComplete}
                  required={element.required ?? true}
                />
              </div>
            ))}
          </div>

          {state.message && (
            <p
              className={styles.formMessage}
              role={state.type === "error" ? "alert" : "status"}
            >
              {state.message}
            </p>
          )}

          <FormSubmit message={submitMessage} />
        </form>

        {footerText && footerHref && (
          <p className={styles.formFooter}>
            {footerText} <Link href={footerHref}>{footerLabel}</Link>
          </p>
        )}
      </section>
    </main>
  );
}
