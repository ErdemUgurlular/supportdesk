
"use client";

import { useActionState } from "react";
import Link from "next/link";

import FormSubmit from "./FormSubmit";
import styles from "./Form.module.css";

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
  const [state, formAction] = useActionState(
    action,
    { message: null }
  );

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
                <label htmlFor={element.id}>
                  {element.title}
                </label>

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
            <p className={styles.formMessage} role="status">
              {state.message}
            </p>
          )}

          <FormSubmit message={submitMessage} />
        </form>

        {footerText && footerHref && (
          <p className={styles.formFooter}>
            {footerText}{" "}
            <Link href={footerHref}>{footerLabel}</Link>
          </p>
        )}
      </section>
    </main>
  );
}
