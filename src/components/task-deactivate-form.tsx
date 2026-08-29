"use client";

import { useActionState } from "react";
import { deactivateMaintenanceTask } from "@/app/actions";

export function TaskDeactivateForm({ vehicleId, taskId }: { vehicleId: string; taskId: string }) {
  const [state, action, pending] = useActionState(deactivateMaintenanceTask, {});

  return <form action={action} className="task-deactivate-form">
    <input type="hidden" name="vehicleId" value={vehicleId} />
    <input type="hidden" name="id" value={taskId} />
    <button type="submit" disabled={pending}>{pending ? "Desactivando…" : "Desactivar"}</button>
    {state.error ? <span className="form-error" role="alert">{state.error}</span> : null}
  </form>;
}
