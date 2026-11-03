"use client";

import { useActionState } from "react";
import FormSubmit from "./FormSubmit";

export default function Form({
  headerTitle,
  headerMessage,
  signUp,
  formElements,
  submitMessage,
}) {
  const [state, formAction] = useActionState(signUp, { message: null });
  return (
    <>
      <header>
        <h1>{headerTitle}</h1>
        <p>{headerMessage}</p>
      </header>
      <main>
        <form action={formAction}>
          {formElements.map((element) => {
            return (
              <div key={element.id}>
                <p>{element.title}</p>
                <input
                  type={element.type}
                  id={element.id}
                  name={element.name}
                  required
                ></input>
              </div>
            );
          })}
          {state.message && <p>{state.message}</p>}
          <p>
            <FormSubmit message={submitMessage} />
          </p>
        </form>
      </main>
    </>
  );
}
