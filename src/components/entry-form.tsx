"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import type { FormState } from "@/app/actions";

type FormAction = (previousState: FormState, formData: FormData) => Promise<FormState>;

export function EntryForm({ action, vehicleId, recordId, title, description, submitLabel, backHref, children }: { action: FormAction; vehicleId: string; recordId?: string; title: string; description?: string; submitLabel: string; backHref: string; children: ReactNode }) {
  const [state, formAction, pending] = useActionState(action, {});

  return <form action={formAction} className="detail-panel entry-form" aria-busy={pending}>
    <div className="entry-form-heading">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
    <input type="hidden" name="vehicleId" value={vehicleId} />
    {recordId ? <input type="hidden" name="id" value={recordId} /> : null}
    {children}
    <div className="entry-form-feedback" aria-live="polite">
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
    </div>
    <div className="entry-form-actions">
      <Link className="secondary-action" href={backHref}>Cancelar</Link>
      <button type="submit" disabled={pending}>{pending ? "Guardando…" : submitLabel}</button>
    </div>
  </form>;
}
