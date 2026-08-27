import { CalendarCheck, CurrencyEur, FileText, WarningCircle, Wrench } from "@phosphor-icons/react/dist/ssr";
import { DocumentKind, MaintenanceCategory } from "@/generated/prisma/client";
import { createDocumentLink, createMaintenanceEvent, createMaintenanceTask } from "@/app/actions";
import { EntryForm } from "@/components/entry-form";
import type { VehicleDetail } from "@/lib/vehicle-routes";

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

export function VehicleDetailPage({ vehicle }: { vehicle: VehicleDetail }) {
  const costedEvents = vehicle.maintenanceEvents.filter((event) => event.cost !== null);
  const totalCost = costedEvents.reduce((sum, event) => sum + Number(event.cost), 0);

  return (
    <main className="app-main">
      <header className="page-header vehicle-detail-title">
        <div>
          <p className="eyebrow">{vehicle.brand} {vehicle.model}</p>
          <h1>{vehicle.name}</h1>
          <p>{vehicle.licensePlate ?? "Matrícula no registrada"}</p>
        </div>
      </header>

      {vehicle.purchasedAt || vehicle.itvExpiresAt ? (
        <section className="vehicle-data-grid" aria-label={`Datos de ${vehicle.name}`}>
          {vehicle.purchasedAt ? (
            <article>
              <CalendarCheck size={23} aria-hidden="true" />
              <div>
                <span>Comprado</span>
                <strong>{vehicle.purchasedAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</strong>
              </div>
            </article>
          ) : null}
          {vehicle.itvExpiresAt ? (
            <article className="vehicle-data-itv">
              <WarningCircle size={23} aria-hidden="true" />
              <div>
                <span>ITV</span>
                <strong>{vehicle.itvExpiresAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</strong>
                <small>Próximo vencimiento registrado.</small>
              </div>
            </article>
          ) : null}
        </section>
      ) : null}

      <section className="vehicle-cost-summary" aria-label={`Costes de ${vehicle.name}`}>
        <CurrencyEur size={23} aria-hidden="true" />
        <div>
          <span>Coste acumulado</span>
          <strong>{totalCost.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</strong>
          <small>{costedEvents.length} intervenciones con importe.</small>
        </div>
      </section>

      <section className="detail-grid">
        <article className="detail-panel">
          <div className="panel-heading">
            <Wrench size={22} aria-hidden="true" />
            <h2>Historial</h2>
          </div>
          {vehicle.maintenanceEvents.map((event) => (
            <div className="history-row" key={event.id}>
              <div>
                <strong>{event.title}</strong>
                <span>{event.serviceDate.toLocaleDateString("es-ES")}{event.odometerKm ? ` · ${event.odometerKm.toLocaleString("es-ES")} km` : ""}</span>
                <small>{event.provider?.name ?? "Taller no registrado"}</small>
              </div>
              <b>{event.cost ? Number(event.cost).toLocaleString("es-ES", { style: "currency", currency: "EUR" }) : ""}</b>
            </div>
          ))}
        </article>

        <aside className="detail-panel">
          <div className="panel-heading">
            <FileText size={22} aria-hidden="true" />
            <h2>Documentos</h2>
          </div>
          {vehicle.documents.map((document) => (
            <div className="document-row" key={document.id}>
              <strong>{document.title}</strong>
              {document.expiresAt ? <span>Vence el {document.expiresAt.toLocaleDateString("es-ES")}</span> : null}
              {document.url ? <a href={document.url} target="_blank" rel="noreferrer">Abrir enlace</a> : <small>Sin enlace disponible</small>}
            </div>
          ))}
          {vehicle.insurancePolicies.map((policy) => (
            <div className="document-row" key={policy.id}>
              <strong>Seguro {policy.insurer ?? ""}</strong>
              {policy.expiresAt ? <span>Vence el {policy.expiresAt.toLocaleDateString("es-ES")}</span> : null}
              {policy.documentUrl ? <a href={policy.documentUrl} target="_blank" rel="noreferrer">Abrir póliza</a> : null}
            </div>
          ))}
        </aside>
      </section>

      <section className="forms-grid">
        <EntryForm action={createMaintenanceEvent} vehicleId={vehicle.id} title="Registrar trabajo" submitLabel="Guardar intervención">
          <label>Título<input name="title" required /></label>
          <label>Categoría<select name="category" defaultValue={MaintenanceCategory.MAINTENANCE}>{Object.values(MaintenanceCategory).map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></label>
          <label>Fecha<input name="serviceDate" type="date" required /></label>
          <label>Kilómetros<input name="odometerKm" type="number" min="0" /></label>
          <label>Coste<input name="cost" type="number" step="0.01" min="0" /></label>
          <label>Taller<input name="providerName" /></label>
          <label>Notas<textarea name="notes" rows={3} /></label>
          <label>Enlace factura<input name="invoiceUrl" type="url" /></label>
        </EntryForm>

        <EntryForm action={createMaintenanceTask} vehicleId={vehicle.id} title="Añadir mantenimiento" submitLabel="Guardar regla">
          <label>Tarea<input name="title" required /></label>
          <label>Categoría<select name="category" defaultValue={MaintenanceCategory.MAINTENANCE}>{Object.values(MaintenanceCategory).map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></label>
          <label>Cada meses<input name="intervalMonths" type="number" min="1" /></label>
          <label>Cada kilómetros<input name="intervalKm" type="number" min="1" /></label>
          <label>Notas<textarea name="notes" rows={3} /></label>
        </EntryForm>

        <EntryForm action={createDocumentLink} vehicleId={vehicle.id} title="Añadir enlace" submitLabel="Guardar enlace">
          <label>Título<input name="title" required /></label>
          <label>Tipo<select name="kind" defaultValue={DocumentKind.OTHER}>{Object.values(DocumentKind).map((value) => <option key={value} value={value}>{documentKindLabels[value]}</option>)}</select></label>
          <label>URL<input name="url" type="url" /></label>
          <label>Caducidad<input name="expiresAt" type="date" /></label>
        </EntryForm>
      </section>
    </main>
  );
}
