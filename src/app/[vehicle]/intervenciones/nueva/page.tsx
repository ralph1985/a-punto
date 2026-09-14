import { notFound } from "next/navigation";
import { MaintenanceEventForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";
import { parseHistoryFilters, vehicleHistoryHref } from "@/lib/vehicle-history";
import { parseVehicleTab, vehicleTabHref } from "@/lib/vehicle-tabs";

export default async function NewMaintenanceEventPage({ params, searchParams }: { params: Promise<{ vehicle: string }>; searchParams: Promise<{ from?: string | string[]; year?: string | string[]; category?: string | string[]; q?: string | string[] }> }) {
  await requireSession();
  const { vehicle: slug } = await params;
  const search = await searchParams;
  const returnTab = parseVehicleTab(search.from);
  const returnFilters = returnTab === "historial" ? parseHistoryFilters(search) : {};
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const backHref = returnTab === "historial" ? vehicleHistoryHref(vehicle.slug, returnFilters) : vehicleTabHref(vehicle.slug, returnTab);
  return <VehicleEntryPage vehicle={vehicle} returnTab={returnTab} title="Registrar trabajo" description="Añade una intervención al historial de mantenimiento.">
    <MaintenanceEventForm vehicleId={vehicle.id} backHref={backHref} />
  </VehicleEntryPage>;
}
