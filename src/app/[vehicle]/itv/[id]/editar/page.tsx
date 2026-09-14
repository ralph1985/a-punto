import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ItvInspectionForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";
import { parseVehicleTab, vehicleTabHref } from "@/lib/vehicle-tabs";

export default async function EditItvInspectionPage({ params, searchParams }: { params: Promise<{ vehicle: string; id: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
  await requireSession();
  const { vehicle: slug, id } = await params;
  const { from } = await searchParams;
  const returnTab = parseVehicleTab(from);
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const inspection = await db.itvInspection.findFirst({ where: { id, vehicleId: vehicle.id } });
  if (!inspection) notFound();

  return <VehicleEntryPage vehicle={vehicle} returnTab={returnTab} title="Editar ITV" description={`Actualiza los datos de la ITV de ${vehicle.name}.`}>
    <ItvInspectionForm vehicleId={vehicle.id} backHref={vehicleTabHref(vehicle.slug, returnTab)} editing initial={{ ...inspection, fee: inspection.fee === null ? null : Number(inspection.fee) }} />
  </VehicleEntryPage>;
}
