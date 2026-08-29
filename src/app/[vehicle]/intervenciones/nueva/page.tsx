import { notFound } from "next/navigation";
import { MaintenanceEventForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function NewMaintenanceEventPage({ params }: { params: Promise<{ vehicle: string }> }) {
  await requireSession();
  const { vehicle: slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  return <VehicleEntryPage vehicle={vehicle} title="Registrar trabajo" description="Añade una intervención al historial de mantenimiento.">
    <MaintenanceEventForm vehicleId={vehicle.id} backHref={`/${vehicle.slug}`} />
  </VehicleEntryPage>;
}
