import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DocumentLinkForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";
import { parseVehicleTab, vehicleTabHref } from "@/lib/vehicle-tabs";

export default async function EditDocumentLinkPage({ params, searchParams }: { params: Promise<{ vehicle: string; id: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
  await requireSession();
  const { vehicle: slug, id } = await params;
  const { from } = await searchParams;
  const returnTab = parseVehicleTab(from);
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const document = await db.documentLink.findFirst({ where: { id, vehicleId: vehicle.id } });
  if (!document) notFound();

  return <VehicleEntryPage vehicle={vehicle} returnTab={returnTab} title="Editar enlace" description={`Actualiza el enlace documental de ${vehicle.name}.`}>
    <DocumentLinkForm vehicleId={vehicle.id} backHref={vehicleTabHref(vehicle.slug, returnTab)} editing initial={{ id: document.id, title: document.title, kind: document.kind, url: document.url, expiresAt: document.expiresAt }} />
  </VehicleEntryPage>;
}
