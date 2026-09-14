import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MaintenanceEventForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";
import { parseHistoryFilters, vehicleHistoryHref } from "@/lib/vehicle-history";
import { parseVehicleTab, vehicleTabHref } from "@/lib/vehicle-tabs";

export default async function EditMaintenanceEventPage({ params, searchParams }: { params: Promise<{ vehicle: string; id: string }>; searchParams: Promise<{ from?: string | string[]; year?: string | string[]; category?: string | string[]; q?: string | string[] }> }) {
  await requireSession();
  const { vehicle: slug, id } = await params;
  const search = await searchParams;
  const returnTab = parseVehicleTab(search.from);
  const returnFilters = returnTab === "historial" ? parseHistoryFilters(search) : {};
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const event = await db.maintenanceEvent.findFirst({ where: { id, vehicleId: vehicle.id }, include: { provider: true } });
  if (!event) notFound();

  const backHref = returnTab === "historial" ? vehicleHistoryHref(vehicle.slug, returnFilters) : vehicleTabHref(vehicle.slug, returnTab);
  return <VehicleEntryPage vehicle={vehicle} returnTab={returnTab} title="Editar intervención" description={`Actualiza los datos de la intervención de ${vehicle.name}.`}>
    <MaintenanceEventForm vehicleId={vehicle.id} backHref={backHref} editing initial={{ id: event.id, title: event.title, category: event.category, serviceDate: event.serviceDate, odometerKm: event.odometerKm, cost: event.cost ? Number(event.cost) : null, providerName: event.provider?.name ?? "", notes: event.notes, invoiceUrl: event.invoiceUrl }} />
  </VehicleEntryPage>;
}
