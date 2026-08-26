import { ArrowLeft, FileText, Wrench } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNavigation } from "@/components/app-navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/require-session";
import { createDocumentLink, createMaintenanceEvent, createMaintenanceTask } from "@/app/actions";
import { DocumentKind, MaintenanceCategory } from "@/generated/prisma/client";

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

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const vehicle = await db.vehicle.findUnique({ where: { id }, include: { maintenanceEvents: { include: { provider: true }, orderBy: { serviceDate: "desc" } }, maintenanceTasks: { where: { isActive: true } }, documents: true, insurancePolicies: true } });
  if (!vehicle) notFound();
  return <div className="app-shell"><AppNavigation current="/coches" /><main className="app-main"><Link className="back-link" href="/coches"><ArrowLeft size={18} aria-hidden="true" />Volver a coches</Link><header className="page-header vehicle-detail-title"><div><p className="eyebrow">{vehicle.brand} {vehicle.model}</p><h1>{vehicle.name}</h1><p>{vehicle.licensePlate ?? "Matrícula no registrada"}</p></div></header><section className="detail-grid"><article className="detail-panel"><div className="panel-heading"><Wrench size={22} aria-hidden="true" /><h2>Historial</h2></div>{vehicle.maintenanceEvents.map((event) => <div className="history-row" key={event.id}><div><strong>{event.title}</strong><span>{event.serviceDate.toLocaleDateString("es-ES")}{event.odometerKm ? ` · ${event.odometerKm.toLocaleString("es-ES")} km` : ""}</span><small>{event.provider?.name ?? "Taller no registrado"}</small></div><b>{event.cost ? Number(event.cost).toLocaleString("es-ES", { style: "currency", currency: "EUR" }) : ""}</b></div>)}</article><aside className="detail-panel"><div className="panel-heading"><FileText size={22} aria-hidden="true" /><h2>Documentos</h2></div>{vehicle.documents.map((document) => <div className="document-row" key={document.id}><strong>{document.title}</strong>{document.expiresAt ? <span>Vence el {document.expiresAt.toLocaleDateString("es-ES")}</span> : null}{document.url ? <a href={document.url} target="_blank" rel="noreferrer">Abrir enlace</a> : <small>Sin enlace disponible</small>}</div>)}{vehicle.insurancePolicies.map((policy) => <div className="document-row" key={policy.id}><strong>Seguro {policy.insurer ?? ""}</strong>{policy.expiresAt ? <span>Vence el {policy.expiresAt.toLocaleDateString("es-ES")}</span> : null}{policy.documentUrl ? <a href={policy.documentUrl} target="_blank" rel="noreferrer">Abrir póliza</a> : null}</div>)}</aside></section><section className="forms-grid"><form action={createMaintenanceEvent} className="detail-panel entry-form"><h2>Registrar trabajo</h2><input type="hidden" name="vehicleId" value={vehicle.id} /><label>Título<input name="title" required /></label><label>Categoría<select name="category" defaultValue={MaintenanceCategory.MAINTENANCE}>{Object.values(MaintenanceCategory).map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></label><label>Fecha<input name="serviceDate" type="date" required /></label><label>Kilómetros<input name="odometerKm" type="number" min="0" /></label><label>Coste<input name="cost" type="number" step="0.01" min="0" /></label><label>Taller<input name="providerName" /></label><label>Notas<textarea name="notes" rows={3} /></label><label>Enlace factura<input name="invoiceUrl" type="url" /></label><button type="submit">Guardar intervención</button></form><form action={createMaintenanceTask} className="detail-panel entry-form"><h2>Añadir mantenimiento</h2><input type="hidden" name="vehicleId" value={vehicle.id} /><label>Tarea<input name="title" required /></label><label>Categoría<select name="category" defaultValue={MaintenanceCategory.MAINTENANCE}>{Object.values(MaintenanceCategory).map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></label><label>Cada meses<input name="intervalMonths" type="number" min="1" /></label><label>Cada kilómetros<input name="intervalKm" type="number" min="1" /></label><label>Notas<textarea name="notes" rows={3} /></label><button type="submit">Guardar regla</button></form><form action={createDocumentLink} className="detail-panel entry-form"><h2>Añadir enlace</h2><input type="hidden" name="vehicleId" value={vehicle.id} /><label>Título<input name="title" required /></label><label>Tipo<select name="kind" defaultValue={DocumentKind.OTHER}>{Object.values(DocumentKind).map((value) => <option key={value} value={value}>{documentKindLabels[value]}</option>)}</select></label><label>URL<input name="url" type="url" /></label><label>Caducidad<input name="expiresAt" type="date" /></label><button type="submit">Guardar enlace</button></form></section></main></div>;
}
