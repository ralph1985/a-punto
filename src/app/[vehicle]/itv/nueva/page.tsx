import { notFound } from "next/navigation";
import { ItvInspectionForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";
import { parseVehicleTab, vehicleTabHref } from "@/lib/vehicle-tabs";

export default async function NewItvInspectionPage({ params, searchParams }: { params: Promise<{ vehicle: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
  await requireSession();
  const { vehicle: slug } = await params;
  const { from } = await searchParams;
  const returnTab = parseVehicleTab(from);
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  return <VehicleEntryPage vehicle={vehicle} returnTab={returnTab} title="Registrar ITV" description="Añade una inspección ITV al historial del vehículo.">
    <ItvInspectionForm vehicleId={vehicle.id} backHref={vehicleTabHref(vehicle.slug, returnTab)} />
  </VehicleEntryPage>;
}
