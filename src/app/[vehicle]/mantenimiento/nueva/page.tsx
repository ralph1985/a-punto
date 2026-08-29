import { notFound } from "next/navigation";
import { MaintenanceTaskForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function NewMaintenanceTaskPage({ params }: { params: Promise<{ vehicle: string }> }) {
  await requireSession();
  const { vehicle: slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  return <VehicleEntryPage vehicle={vehicle} title="Añadir mantenimiento" description="Crea una regla para recordar el próximo mantenimiento.">
    <MaintenanceTaskForm vehicleId={vehicle.id} backHref={`/${vehicle.slug}`} />
  </VehicleEntryPage>;
}
