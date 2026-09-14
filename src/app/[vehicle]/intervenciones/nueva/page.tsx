import { notFound } from "next/navigation";
import { MaintenanceEventForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";
import { parseVehicleTab, vehicleTabHref } from "@/lib/vehicle-tabs";

export default async function NewMaintenanceEventPage({ params, searchParams }: { params: Promise<{ vehicle: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
  await requireSession();
  const { vehicle: slug } = await params;
  const { from } = await searchParams;
  const returnTab = parseVehicleTab(from);
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  return <VehicleEntryPage vehicle={vehicle} returnTab={returnTab} title="Registrar trabajo" description="Añade una intervención al historial de mantenimiento.">
    <MaintenanceEventForm vehicleId={vehicle.id} backHref={vehicleTabHref(vehicle.slug, returnTab)} />
  </VehicleEntryPage>;
}
