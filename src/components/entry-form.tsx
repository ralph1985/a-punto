"use client";

import { useActionState, type ReactNode } from "react";
import type { FormState } from "@/app/actions";

type FormAction = (previousState: FormState, formData: FormData) => Promise<FormState>;

export function EntryForm({ action, vehicleId, title, submitLabel, children }: { action: FormAction; vehicleId: string; title: string; submitLabel: string; children: ReactNode }) {
  const [state, formAction, pending] = useActionState(action, {});

  return <form action={formAction} className="detail-panel entry-form" aria-busy={pending}>
    <h2>{title}</h2>
    <input type="hidden" name="vehicleId" value={vehicleId} />
    {children}
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
    <button type="submit" disabled={pending}>{pending ? "Guardando…" : submitLabel}</button>
  </form>;
}
