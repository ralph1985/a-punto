import Link from "next/link";
import { CalendarCheck, CurrencyEur, FileText, PencilSimple, Plus, WarningCircle, Wrench } from "@phosphor-icons/react/dist/ssr";
import { TaskDeactivateForm } from "@/components/task-deactivate-form";
import { isSafeHttpUrl } from "@/lib/safe-url";
import type { VehicleDetail } from "@/lib/vehicle-routes";

const categoryLabels = {
  MAINTENANCE: "Mantenimiento",
  REPAIR: "Reparación",
  INSPECTION: "Inspección",
  TIRES: "Neumáticos",
  INSURANCE: "Seguro",
  OTHER: "Otro",
} as const;

function taskSchedule(task: VehicleDetail["maintenanceTasks"][number]) {
  const schedule = [task.intervalMonths ? `Cada ${task.intervalMonths} meses` : null, task.intervalKm ? `Cada ${task.intervalKm.toLocaleString("es-ES")} km` : null].filter(Boolean);
  return schedule.length > 0 ? schedule.join(" o ") : "Sin plazo configurado";
}

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
          <div className="panel-heading panel-heading-with-action">
            <div className="panel-heading-title"><Wrench size={22} aria-hidden="true" /><h2>Historial</h2></div>
            <Link className="panel-action" href={`/${vehicle.slug}/intervenciones/nueva`}><Plus size={17} aria-hidden="true" /> Registrar</Link>
          </div>
          {vehicle.maintenanceEvents.length > 0 ? vehicle.maintenanceEvents.map((event) => (
            <div className="history-row" key={event.id}>
              <div className="history-row-content">
                <strong>{event.title}</strong>
                <span>{event.serviceDate.toLocaleDateString("es-ES")}{event.odometerKm ? ` · ${event.odometerKm.toLocaleString("es-ES")} km` : ""}</span>
                <small>{event.provider?.name ?? "Taller no registrado"}</small>
              </div>
              <div className="row-actions">
                <b>{event.cost ? Number(event.cost).toLocaleString("es-ES", { style: "currency", currency: "EUR" }) : ""}</b>
                <Link className="row-edit" href={`/${vehicle.slug}/intervenciones/${event.id}/editar`} aria-label={`Editar ${event.title}`}><PencilSimple size={17} aria-hidden="true" /> <span>Editar</span></Link>
              </div>
            </div>
          )) : <p className="empty-state">Todavía no hay intervenciones registradas.</p>}
        </article>

        <aside className="detail-panel">
          <div className="panel-heading panel-heading-with-action">
            <div className="panel-heading-title"><FileText size={22} aria-hidden="true" /><h2>Documentos</h2></div>
            <Link className="panel-action" href={`/${vehicle.slug}/documentos/nuevo`}><Plus size={17} aria-hidden="true" /> Añadir</Link>
          </div>
          {vehicle.documents.length > 0 ? vehicle.documents.map((document) => (
            <div className="document-row" key={document.id}>
              <div>
                <strong>{document.title}</strong>
                {document.expiresAt ? <span>Vence el {document.expiresAt.toLocaleDateString("es-ES")}</span> : null}
                {document.url && isSafeHttpUrl(document.url) ? <a href={document.url} target="_blank" rel="noreferrer">Abrir enlace</a> : <small>Sin enlace disponible</small>}
              </div>
              <Link className="row-edit" href={`/${vehicle.slug}/documentos/${document.id}/editar`} aria-label={`Editar ${document.title}`}><PencilSimple size={17} aria-hidden="true" /> <span>Editar</span></Link>
            </div>
          )) : <p className="empty-state">Todavía no hay enlaces documentales.</p>}
          {vehicle.insurancePolicies.map((policy) => (
            <div className="document-row" key={policy.id}>
              <strong>Seguro {policy.insurer ?? ""}</strong>
              {policy.expiresAt ? <span>Vence el {policy.expiresAt.toLocaleDateString("es-ES")}</span> : null}
              {policy.documentUrl && isSafeHttpUrl(policy.documentUrl) ? <a href={policy.documentUrl} target="_blank" rel="noreferrer">Abrir póliza</a> : null}
            </div>
          ))}
        </aside>
      </section>

      <section className="detail-panel maintenance-rules-panel">
        <div className="panel-heading panel-heading-with-action">
          <div className="panel-heading-title"><WarningCircle size={22} aria-hidden="true" /><h2>Mantenimiento programado</h2></div>
          <Link className="panel-action" href={`/${vehicle.slug}/mantenimiento/nueva`}><Plus size={17} aria-hidden="true" /> Añadir</Link>
        </div>
        {vehicle.maintenanceTasks.length > 0 ? <div className="maintenance-rules-list">{vehicle.maintenanceTasks.map((task) => (
          <div className="maintenance-rule-row" key={task.id}>
            <div>
              <strong>{task.title}</strong>
              <span>{categoryLabels[task.category]} · {taskSchedule(task)}</span>
              {task.notes ? <small>{task.notes}</small> : null}
            </div>
            <div className="row-actions">
              <Link className="row-edit" href={`/${vehicle.slug}/mantenimiento/${task.id}/editar`} aria-label={`Editar ${task.title}`}><PencilSimple size={17} aria-hidden="true" /> <span>Editar</span></Link>
              <TaskDeactivateForm vehicleId={vehicle.id} taskId={task.id} />
            </div>
          </div>
        ))}</div> : <p className="empty-state">No hay reglas activas. Añade una para recibir avisos.</p>}
      </section>
    </main>
  );
}
