import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MaintenanceEventForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function EditMaintenanceEventPage({ params }: { params: Promise<{ vehicle: string; id: string }> }) {
  await requireSession();
  const { vehicle: slug, id } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const event = await db.maintenanceEvent.findFirst({ where: { id, vehicleId: vehicle.id }, include: { provider: true } });
  if (!event) notFound();

  return <VehicleEntryPage vehicle={vehicle} title="Editar intervención" description={`Actualiza los datos de la intervención de ${vehicle.name}.`}>
    <MaintenanceEventForm vehicleId={vehicle.id} backHref={`/${vehicle.slug}`} editing initial={{ id: event.id, title: event.title, category: event.category, serviceDate: event.serviceDate, odometerKm: event.odometerKm, cost: event.cost ? Number(event.cost) : null, providerName: event.provider?.name ?? "", notes: event.notes, invoiceUrl: event.invoiceUrl }} />
  </VehicleEntryPage>;
}
