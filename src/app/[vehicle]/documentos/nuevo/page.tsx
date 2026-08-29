import { notFound } from "next/navigation";
import { DocumentLinkForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function NewDocumentLinkPage({ params }: { params: Promise<{ vehicle: string }> }) {
  await requireSession();
  const { vehicle: slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  return <VehicleEntryPage vehicle={vehicle} title="Añadir enlace" description="Guarda una referencia a la documentación del vehículo.">
    <DocumentLinkForm vehicleId={vehicle.id} backHref={`/${vehicle.slug}`} />
  </VehicleEntryPage>;
}
