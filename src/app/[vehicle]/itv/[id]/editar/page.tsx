import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ItvInspectionForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function EditItvInspectionPage({ params }: { params: Promise<{ vehicle: string; id: string }> }) {
  await requireSession();
  const { vehicle: slug, id } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const inspection = await db.itvInspection.findFirst({ where: { id, vehicleId: vehicle.id } });
  if (!inspection) notFound();

  return <VehicleEntryPage vehicle={vehicle} title="Editar ITV" description={`Actualiza los datos de la ITV de ${vehicle.name}.`}>
    <ItvInspectionForm vehicleId={vehicle.id} backHref={`/${vehicle.slug}`} editing initial={{ ...inspection, fee: inspection.fee === null ? null : Number(inspection.fee) }} />
  </VehicleEntryPage>;
}
