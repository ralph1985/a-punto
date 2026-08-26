"use client";

import { Keyhole } from "@phosphor-icons/react";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="login-form">
      <label htmlFor="code">Código de acceso</label>
      <input id="code" name="code" type="password" autoComplete="current-password" required />
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending}>
        <Keyhole size={20} weight="bold" aria-hidden="true" />
        {pending ? "Comprobando" : "Entrar"}
      </button>
    </form>
  );
}
