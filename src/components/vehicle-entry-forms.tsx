import { DocumentKind, MaintenanceCategory } from "@/generated/prisma/client";
import { createDocumentLink, createMaintenanceEvent, createMaintenanceTask, updateDocumentLink, updateMaintenanceEvent, updateMaintenanceTask } from "@/app/actions";
import { EntryForm } from "@/components/entry-form";

const categoryLabels: Record<MaintenanceCategory, string> = {
  MAINTENANCE: "Mantenimiento",
  REPAIR: "Reparación",
  INSPECTION: "Inspección",
  TIRES: "Neumáticos",
  INSURANCE: "Seguro",
  OTHER: "Otro",
};

const documentKindLabels: Record<DocumentKind, string> = {
  INSURANCE: "Seguro",
  INSPECTION: "Inspección",
  REGISTRATION: "Permiso de circulación",
  TECHNICAL_SPECS: "Ficha técnica",
  PURCHASE: "Compra",
  INVOICE: "Factura",
  OTHER: "Otro",
};

function dateValue(date: Date | null | undefined) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type EventValues = {
  id?: string;
  title?: string;
  category?: MaintenanceCategory;
  serviceDate?: Date;
  odometerKm?: number | null;
  cost?: number | null;
  providerName?: string;
  notes?: string | null;
  invoiceUrl?: string | null;
};

export function MaintenanceEventForm({ vehicleId, backHref, initial = {}, editing = false }: { vehicleId: string; backHref: string; initial?: EventValues; editing?: boolean }) {
  return <EntryForm action={editing ? updateMaintenanceEvent : createMaintenanceEvent} vehicleId={vehicleId} recordId={initial.id} title={editing ? "Editar intervención" : "Registrar trabajo"} description="Guarda lo que se hizo, cuándo y con qué coste." submitLabel={editing ? "Guardar cambios" : "Guardar intervención"} backHref={backHref}>
    <label htmlFor="event-title">Título<input id="event-title" name="title" defaultValue={initial.title} required autoFocus /></label>
    <label htmlFor="event-category">Categoría<select id="event-category" name="category" defaultValue={initial.category ?? MaintenanceCategory.MAINTENANCE}>{Object.values(MaintenanceCategory).map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></label>
    <label htmlFor="event-date">Fecha<input id="event-date" name="serviceDate" type="date" defaultValue={dateValue(initial.serviceDate)} required /></label>
    <label htmlFor="event-odometer">Kilómetros<input id="event-odometer" name="odometerKm" type="number" min="0" inputMode="numeric" defaultValue={initial.odometerKm ?? ""} /></label>
    <label htmlFor="event-cost">Coste<input id="event-cost" name="cost" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={initial.cost ?? ""} /></label>
    <label htmlFor="event-provider">Taller<input id="event-provider" name="providerName" defaultValue={initial.providerName} autoComplete="organization" /></label>
    <label htmlFor="event-notes">Notas<textarea id="event-notes" name="notes" rows={4} defaultValue={initial.notes ?? ""} /></label>
    <label htmlFor="event-invoice">Enlace factura<input id="event-invoice" name="invoiceUrl" type="url" inputMode="url" defaultValue={initial.invoiceUrl ?? ""} /></label>
  </EntryForm>;
}

type TaskValues = {
  id?: string;
  title?: string;
  category?: MaintenanceCategory;
  intervalMonths?: number | null;
  intervalKm?: number | null;
  notes?: string | null;
};

export function MaintenanceTaskForm({ vehicleId, backHref, initial = {}, editing = false }: { vehicleId: string; backHref: string; initial?: TaskValues; editing?: boolean }) {
  return <EntryForm action={editing ? updateMaintenanceTask : createMaintenanceTask} vehicleId={vehicleId} recordId={initial.id} title={editing ? "Editar mantenimiento" : "Añadir mantenimiento"} description="Define cuándo debe volver a revisarse este elemento." submitLabel={editing ? "Guardar cambios" : "Guardar regla"} backHref={backHref}>
    <label htmlFor="task-title">Tarea<input id="task-title" name="title" defaultValue={initial.title} required autoFocus /></label>
    <label htmlFor="task-category">Categoría<select id="task-category" name="category" defaultValue={initial.category ?? MaintenanceCategory.MAINTENANCE}>{Object.values(MaintenanceCategory).map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></label>
    <label htmlFor="task-months">Cada meses<input id="task-months" name="intervalMonths" type="number" min="1" inputMode="numeric" defaultValue={initial.intervalMonths ?? ""} /></label>
    <label htmlFor="task-kilometres">Cada kilómetros<input id="task-kilometres" name="intervalKm" type="number" min="1" inputMode="numeric" defaultValue={initial.intervalKm ?? ""} /></label>
    <p className="field-help">Indica al menos un plazo, por meses o por kilómetros.</p>
    <label htmlFor="task-notes">Notas<textarea id="task-notes" name="notes" rows={4} defaultValue={initial.notes ?? ""} /></label>
  </EntryForm>;
}

type DocumentValues = {
  id?: string;
  title?: string;
  kind?: DocumentKind;
  url?: string | null;
  expiresAt?: Date | null;
};

export function DocumentLinkForm({ vehicleId, backHref, initial = {}, editing = false }: { vehicleId: string; backHref: string; initial?: DocumentValues; editing?: boolean }) {
  return <EntryForm action={editing ? updateDocumentLink : createDocumentLink} vehicleId={vehicleId} recordId={initial.id} title={editing ? "Editar enlace" : "Añadir enlace"} description="Conserva aquí la referencia al documento, no el archivo privado." submitLabel={editing ? "Guardar cambios" : "Guardar enlace"} backHref={backHref}>
    <label htmlFor="document-title">Título<input id="document-title" name="title" defaultValue={initial.title} required autoFocus /></label>
    <label htmlFor="document-kind">Tipo<select id="document-kind" name="kind" defaultValue={initial.kind ?? DocumentKind.OTHER}>{Object.values(DocumentKind).map((value) => <option key={value} value={value}>{documentKindLabels[value]}</option>)}</select></label>
    <label htmlFor="document-url">URL<input id="document-url" name="url" type="url" inputMode="url" defaultValue={initial.url ?? ""} /></label>
    <label htmlFor="document-expires">Caducidad<input id="document-expires" name="expiresAt" type="date" defaultValue={dateValue(initial.expiresAt)} /></label>
  </EntryForm>;
}
