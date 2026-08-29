import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DocumentLinkForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function EditDocumentLinkPage({ params }: { params: Promise<{ vehicle: string; id: string }> }) {
  await requireSession();
  const { vehicle: slug, id } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const document = await db.documentLink.findFirst({ where: { id, vehicleId: vehicle.id } });
  if (!document) notFound();

  return <VehicleEntryPage vehicle={vehicle} title="Editar enlace" description={`Actualiza el enlace documental de ${vehicle.name}.`}>
    <DocumentLinkForm vehicleId={vehicle.id} backHref={`/${vehicle.slug}`} editing initial={{ id: document.id, title: document.title, kind: document.kind, url: document.url, expiresAt: document.expiresAt }} />
  </VehicleEntryPage>;
}
