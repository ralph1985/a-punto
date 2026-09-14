import Link from "next/link";
import { CalendarCheck, CurrencyEur, FileText, Gauge, PencilSimple, Plus, WarningCircle, Wrench } from "@phosphor-icons/react/dist/ssr";
import { TaskDeactivateForm } from "@/components/task-deactivate-form";
import { isSafeHttpUrl } from "@/lib/safe-url";
import { itvResultClasses, itvResultLabels } from "@/lib/itv";
import { evaluateTask, type TaskStatus } from "@/lib/maintenance";
import { filterHistory, groupHistory, historyCategoryValues, historyReturnQuery, historySummary, historyYears, vehicleHistoryHref, type HistoryEvent, type HistoryFilters } from "@/lib/vehicle-history";
import { vehicleTabHref, vehicleTabs, type VehicleTab } from "@/lib/vehicle-tabs";
import type { VehicleDetail } from "@/lib/vehicle-routes";

const categoryLabels = {
  MAINTENANCE: "Mantenimiento",
  REPAIR: "Reparación",
  INSPECTION: "Inspección",
  TIRES: "Neumáticos",
  INSURANCE: "Seguro",
  OTHER: "Otro",
} as const;

const taskStatusLabels: Record<TaskStatus, string> = {
  overdue: "Vencido",
  soon: "Próximo",
  "needs-odometer": "Falta odómetro",
  upcoming: "Programado",
  unscheduled: "Sin plazo",
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function formatLongDate(date: Date) {
  return longDateFormatter.format(date);
}

function formatKm(valueKm: number | null) {
  return valueKm === null ? "No registrado" : `${valueKm.toLocaleString("es-ES")} km`;
}

function taskSchedule(task: VehicleDetail["maintenanceTasks"][number]) {
  const schedule = [task.intervalMonths ? `Cada ${task.intervalMonths} meses` : null, task.intervalKm ? `Cada ${task.intervalKm.toLocaleString("es-ES")} km` : null].filter(Boolean);
  return schedule.length > 0 ? schedule.join(" o ") : "Sin plazo configurado";
}

function HistoryRow({ event, vehicleSlug, returnTab = "historial" }: { event: HistoryEvent; vehicleSlug: string; returnTab?: VehicleTab }) {
  const eventMeta = [categoryLabels[event.category], formatDate(event.serviceDate), event.odometerKm !== null ? formatKm(event.odometerKm) : null].filter(Boolean).join(" · ");

  return <div className="history-row">
    <div className="history-row-content">
      <strong>{event.title}</strong>
      <span>{eventMeta}</span>
      <small>{event.provider?.name ?? "Taller no registrado"}</small>
    </div>
    <div className="row-actions">
      {event.cost !== null ? <b>{Number(event.cost).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</b> : null}
      <Link className="row-edit" href={`/${vehicleSlug}/intervenciones/${event.id}/editar?from=${returnTab}`} aria-label={`Editar ${event.title}`}><PencilSimple size={17} aria-hidden="true" /> <span>Editar</span></Link>
    </div>
  </div>;
}

function HistoryEventRow({ event, vehicleSlug, filters }: { event: HistoryEvent; vehicleSlug: string; filters: HistoryFilters }) {
  const editHref = `/${vehicleSlug}/intervenciones/${event.id}/editar?${historyReturnQuery(filters)}`;
  const eventMeta = [event.odometerKm !== null ? formatKm(event.odometerKm) : null, event.provider?.name ?? "Taller no registrado"].filter(Boolean).join(" · ");
  const invoiceUrl = event.invoiceUrl && isSafeHttpUrl(event.invoiceUrl) ? event.invoiceUrl : null;

  return <details className="history-event">
    <summary className="history-event-summary">
      <time className="history-event-date" dateTime={event.serviceDate.toISOString()}>{formatDate(event.serviceDate)}</time>
      <span className="history-event-copy">
        <span className="history-event-title"><span className="history-category">{categoryLabels[event.category]}</span><strong>{event.title}</strong></span>
        <span className="history-event-meta">{eventMeta}</span>
      </span>
      <span className="history-event-side">
        {event.cost !== null ? <b className="history-event-cost">{Number(event.cost).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</b> : null}
        <span className="history-event-chevron" aria-hidden="true">+</span>
      </span>
    </summary>
    <div className="history-event-details">
      {event.notes ? <p><strong>Notas</strong>{event.notes}</p> : null}
      {invoiceUrl ? <a href={invoiceUrl} target="_blank" rel="noreferrer">Abrir factura</a> : null}
      <Link className="history-event-edit" href={editHref} aria-label={`Editar ${event.title}`}><PencilSimple size={17} aria-hidden="true" /> Editar intervención</Link>
    </div>
  </details>;
}

function PanelHeading({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return <div className="panel-heading panel-heading-with-action">
    <div className="panel-heading-title">{icon}<h2>{title}</h2></div>
    {action}
  </div>;
}

function VehicleTabs({ vehicleSlug, activeTab }: { vehicleSlug: string; activeTab: VehicleTab }) {
  return <nav className="vehicle-tabs" aria-label="Secciones del vehículo">
    {vehicleTabs.map((tab) => <Link key={tab.id} className={activeTab === tab.id ? "vehicle-tab active" : "vehicle-tab"} href={vehicleTabHref(vehicleSlug, tab.id)} aria-current={activeTab === tab.id ? "page" : undefined}>{tab.label}</Link>)}
  </nav>;
}

type EvaluatedTask = VehicleDetail["maintenanceTasks"][number] & { evaluation: ReturnType<typeof evaluateTask> };

function SummaryTab({ vehicle, tasks, latestMaintenance }: { vehicle: VehicleDetail; tasks: EvaluatedTask[]; latestMaintenance: VehicleDetail["maintenanceEvents"][number] | undefined }) {
  const latestItv = vehicle.itvInspections[0];
  const recentEvents = vehicle.maintenanceEvents.slice(0, 3);
  const costedEvents = vehicle.maintenanceEvents.filter((event) => event.cost !== null);
  const totalCost = costedEvents.reduce((sum, event) => sum + Number(event.cost), 0);

  return <>
    <section className="vehicle-data-grid summary-data-grid" aria-label={`Datos destacados de ${vehicle.name}`}>
      <article className="vehicle-data-odometer">
        <Gauge size={23} aria-hidden="true" />
        <div><span>Odómetro actual</span><strong>{formatKm(vehicle.odometerReadings[0]?.valueKm ?? null)}</strong><small>{vehicle.odometerReadings[0] ? `Actualizado el ${formatDate(vehicle.odometerReadings[0].recordedAt)}.` : "Añade una lectura para evaluar kilómetros."}</small></div>
      </article>
      <article>
        <Wrench size={23} aria-hidden="true" />
        <div><span>Última revisión</span><strong>{latestMaintenance ? formatDate(latestMaintenance.serviceDate) : "No registrada"}</strong><small>{latestMaintenance?.title ?? "Todavía no hay una revisión rutinaria."}</small></div>
      </article>
      {vehicle.itvExpiresAt ? <article className="vehicle-data-itv">
        <WarningCircle size={23} aria-hidden="true" />
        <div><span>Próxima ITV</span><strong>{formatLongDate(vehicle.itvExpiresAt)}</strong><small>{latestItv ? `Último resultado: ${itvResultLabels[latestItv.result]}.` : "Próximo vencimiento registrado."}</small></div>
      </article> : null}
      <article>
        <CurrencyEur size={23} aria-hidden="true" />
        <div><span>Coste acumulado</span><strong>{totalCost.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</strong><small>{costedEvents.length} intervenciones con importe.</small></div>
      </article>
      {vehicle.purchasedAt ? <article>
        <CalendarCheck size={23} aria-hidden="true" />
        <div><span>Comprado</span><strong>{formatLongDate(vehicle.purchasedAt)}</strong></div>
      </article> : null}
    </section>

    <div className="summary-grid">
      <section className="detail-panel summary-maintenance-panel">
        <PanelHeading icon={<WarningCircle size={22} aria-hidden="true" />} title="Avisos de mantenimiento" action={<Link className="panel-action" href={`/${vehicle.slug}/mantenimiento/nueva?from=resumen`}><Plus size={17} aria-hidden="true" /> Añadir</Link>} />
        {tasks.length > 0 ? <div className="maintenance-rules-list">{tasks.map((task) => (
          <div className="maintenance-rule-row" key={task.id}>
            <div className="maintenance-rule-copy">
              <div className="maintenance-rule-title"><span className={`task-status ${task.evaluation.status}`}>{taskStatusLabels[task.evaluation.status]}</span><strong>{task.title}</strong></div>
              <span>{categoryLabels[task.category]} · {taskSchedule(task)}</span>
              {task.evaluation.reasons.length > 0 ? <small>{task.evaluation.reasons.join(" · ")}</small> : null}
              {task.notes ? <small>{task.notes}</small> : null}
            </div>
            <div className="row-actions">
              <Link className="row-edit" href={`/${vehicle.slug}/mantenimiento/${task.id}/editar?from=resumen`} aria-label={`Editar ${task.title}`}><PencilSimple size={17} aria-hidden="true" /> <span>Editar</span></Link>
              <TaskDeactivateForm vehicleId={vehicle.id} taskId={task.id} />
            </div>
          </div>
        ))}</div> : <p className="empty-state">No hay avisos activos. Añade una regla para recibir recordatorios.</p>}
      </section>

      <aside className="detail-panel summary-history-panel">
        <PanelHeading icon={<Wrench size={22} aria-hidden="true" />} title="Últimas intervenciones" action={<Link className="panel-action" href={vehicleTabHref(vehicle.slug, "historial")}>Ver historial</Link>} />
        {recentEvents.length > 0 ? <div className="history-preview-list">{recentEvents.map((event) => <HistoryRow key={event.id} event={event} vehicleSlug={vehicle.slug} returnTab="resumen" />)}</div> : <p className="empty-state">Todavía no hay intervenciones registradas.</p>}
        {vehicle.maintenanceEvents.length > recentEvents.length ? <Link className="summary-more-link" href={vehicleTabHref(vehicle.slug, "historial")}>Ver las {vehicle.maintenanceEvents.length} intervenciones</Link> : null}
      </aside>
    </div>
  </>;
}

function HistoryTab({ vehicle, filters }: { vehicle: VehicleDetail; filters: HistoryFilters }) {
  const filteredEvents = filterHistory(vehicle.maintenanceEvents, filters);
  const groups = groupHistory(filteredEvents);
  const years = historyYears(vehicle.maintenanceEvents);
  const summary = historySummary(filteredEvents);
  const hasFilters = filters.year !== undefined || filters.category !== undefined || filters.query !== undefined;
  const dateRange = summary.firstDate && summary.lastDate && summary.firstDate.getTime() !== summary.lastDate.getTime() ? `${formatDate(summary.firstDate)} – ${formatDate(summary.lastDate)}` : summary.lastDate ? formatDate(summary.lastDate) : "Sin fechas";

  return <section className="detail-panel history-panel">
    <PanelHeading icon={<Wrench size={22} aria-hidden="true" />} title="Historial de intervenciones" action={<Link className="panel-action" href={`/${vehicle.slug}/intervenciones/nueva?${historyReturnQuery(filters)}`}><Plus size={17} aria-hidden="true" /> Registrar</Link>} />
    <form className="history-filter-form" method="get">
      <input type="hidden" name="tab" value="historial" />
      <label className="history-filter-search" htmlFor="history-search">Buscar<input id="history-search" name="q" type="search" defaultValue={filters.query ?? ""} placeholder="Aceite, taller…" /></label>
      <label htmlFor="history-year">Año<select id="history-year" name="year" defaultValue={filters.year?.toString() ?? ""}><option value="">Todos</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
      <label htmlFor="history-category">Categoría<select id="history-category" name="category" defaultValue={filters.category ?? ""}><option value="">Todas</option>{historyCategoryValues.map((category) => <option key={category} value={category}>{categoryLabels[category]}</option>)}</select></label>
      <div className="history-filter-actions"><button type="submit">Filtrar</button>{hasFilters ? <Link href={vehicleHistoryHref(vehicle.slug)}>Limpiar</Link> : null}</div>
    </form>
    <div className="history-result-summary" aria-live="polite"><strong>{summary.count} {summary.count === 1 ? "intervención" : "intervenciones"}</strong><span>{summary.costCount > 0 ? `${summary.totalCost.toLocaleString("es-ES", { style: "currency", currency: "EUR" })} registrado` : "Sin costes registrados"}</span><span>{dateRange}</span></div>
    {groups.length > 0 ? <div className="history-year-groups">{groups.map((group, index) => <details className="history-year-group" key={group.year} open={index === 0}>
      <summary><strong>{group.year}</strong><span>{group.events.length} {group.events.length === 1 ? "intervención" : "intervenciones"}</span></summary>
      <div className="history-year-list">{group.events.map((event) => <HistoryEventRow key={event.id} event={event} vehicleSlug={vehicle.slug} filters={filters} />)}</div>
    </details>)}</div> : vehicle.maintenanceEvents.length > 0 && hasFilters ? <div className="empty-state history-no-results"><strong>No hay coincidencias.</strong><span>Prueba con otros filtros para encontrar una intervención.</span><Link href={vehicleHistoryHref(vehicle.slug)}>Limpiar filtros</Link></div> : <p className="empty-state">Todavía no hay intervenciones registradas. Registra la primera para empezar el historial.</p>}
  </section>;
}

function ItvTab({ vehicle }: { vehicle: VehicleDetail }) {
  return <section className="detail-panel itv-panel">
    <PanelHeading icon={<WarningCircle size={22} aria-hidden="true" />} title="Inspecciones ITV" action={<Link className="panel-action" href={`/${vehicle.slug}/itv/nueva?from=itv`}><Plus size={17} aria-hidden="true" /> Añadir ITV</Link>} />
    {vehicle.itvInspections.length > 0 ? <div className="itv-inspections-list">{vehicle.itvInspections.map((inspection) => (
      <div className="itv-inspection-row" key={inspection.id}>
        <div>
          <div className="itv-inspection-heading"><strong>{itvResultLabels[inspection.result]}</strong><span className={`itv-result ${itvResultClasses[inspection.result]}`}>{itvResultLabels[inspection.result]}</span></div>
          <span>Inspección: {formatDate(inspection.inspectionDate)} · Próxima: {formatDate(inspection.nextInspectionDate)}</span>
          {inspection.odometerKm !== null ? <span>{formatKm(inspection.odometerKm)}{inspection.stationName ? ` · ${inspection.stationName}` : ""}</span> : null}
          {inspection.reportNumber || inspection.invoiceNumber ? <small>{inspection.reportNumber ? `Informe ${inspection.reportNumber}` : ""}{inspection.reportNumber && inspection.invoiceNumber ? " · " : ""}{inspection.invoiceNumber ? `Factura ${inspection.invoiceNumber}` : ""}</small> : null}
          {inspection.fee !== null ? <small>{Number(inspection.fee).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</small> : null}
          {inspection.defects ? <small>Defectos: {inspection.defects}</small> : null}
          {inspection.observations ? <small>{inspection.observations}</small> : null}
        </div>
        <Link className="row-edit" href={`/${vehicle.slug}/itv/${inspection.id}/editar?from=itv`} aria-label={`Editar ITV del ${formatDate(inspection.inspectionDate)}`}><PencilSimple size={17} aria-hidden="true" /> <span>Editar</span></Link>
      </div>
    ))}</div> : <p className="empty-state">Todavía no hay inspecciones ITV registradas.</p>}
  </section>;
}

function DocumentsTab({ vehicle }: { vehicle: VehicleDetail }) {
  const hasDocuments = vehicle.documents.length > 0 || vehicle.insurancePolicies.length > 0;

  return <section className="detail-panel documents-panel">
    <PanelHeading icon={<FileText size={22} aria-hidden="true" />} title="Documentos y seguro" action={<Link className="panel-action" href={`/${vehicle.slug}/documentos/nuevo?from=documentos`}><Plus size={17} aria-hidden="true" /> Añadir</Link>} />
    {hasDocuments ? <div className="documents-list">
      {vehicle.documents.map((document) => <div className="document-row" key={document.id}>
        <div><strong>{document.title}</strong>{document.expiresAt ? <span>Vence el {formatDate(document.expiresAt)}</span> : null}{document.url && isSafeHttpUrl(document.url) ? <a href={document.url} target="_blank" rel="noreferrer">Abrir enlace</a> : <small>Sin enlace disponible</small>}</div>
        <Link className="row-edit" href={`/${vehicle.slug}/documentos/${document.id}/editar?from=documentos`} aria-label={`Editar ${document.title}`}><PencilSimple size={17} aria-hidden="true" /> <span>Editar</span></Link>
      </div>)}
      {vehicle.insurancePolicies.map((policy) => <div className="document-row" key={policy.id}>
        <div><strong>Seguro {policy.insurer ?? ""}</strong>{policy.expiresAt ? <span>Vence el {formatDate(policy.expiresAt)}</span> : null}{policy.documentUrl && isSafeHttpUrl(policy.documentUrl) ? <a href={policy.documentUrl} target="_blank" rel="noreferrer">Abrir póliza</a> : <small>Sin póliza enlazada</small>}</div>
      </div>)}
    </div> : <p className="empty-state">Todavía no hay documentación registrada.</p>}
  </section>;
}

export function VehicleDetailPage({ vehicle, activeTab, historyFilters = {} }: { vehicle: VehicleDetail; activeTab: VehicleTab; historyFilters?: HistoryFilters }) {
  const currentKm = vehicle.odometerReadings[0]?.valueKm ?? null;
  const taskStatusOrder: Record<TaskStatus, number> = { overdue: 0, soon: 1, "needs-odometer": 2, upcoming: 3, unscheduled: 4 };
  const tasks = vehicle.maintenanceTasks.map((task) => ({ ...task, evaluation: evaluateTask(task, currentKm) })).sort((a, b) => taskStatusOrder[a.evaluation.status] - taskStatusOrder[b.evaluation.status]);
  const latestMaintenance = vehicle.maintenanceEvents.find((event) => event.category === "MAINTENANCE");

  return <main className="app-main">
    <header className="page-header vehicle-detail-title">
      <div><p className="eyebrow">{vehicle.brand} {vehicle.model}</p><h1>{vehicle.name}</h1><p>{vehicle.licensePlate ?? "Matrícula no registrada"}</p></div>
    </header>
    <VehicleTabs vehicleSlug={vehicle.slug} activeTab={activeTab} />
    {activeTab === "resumen" ? <SummaryTab vehicle={vehicle} tasks={tasks} latestMaintenance={latestMaintenance} /> : null}
    {activeTab === "historial" ? <HistoryTab vehicle={vehicle} filters={historyFilters} /> : null}
    {activeTab === "itv" ? <ItvTab vehicle={vehicle} /> : null}
    {activeTab === "documentos" ? <DocumentsTab vehicle={vehicle} /> : null}
  </main>;
}
