import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MaintenanceTaskForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function EditMaintenanceTaskPage({ params }: { params: Promise<{ vehicle: string; id: string }> }) {
  await requireSession();
  const { vehicle: slug, id } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const task = await db.maintenanceTask.findFirst({ where: { id, vehicleId: vehicle.id } });
  if (!task) notFound();

  return <VehicleEntryPage vehicle={vehicle} title="Editar mantenimiento" description={`Actualiza la regla de mantenimiento de ${vehicle.name}.`}>
    <MaintenanceTaskForm vehicleId={vehicle.id} backHref={`/${vehicle.slug}`} editing initial={{ id: task.id, title: task.title, category: task.category, intervalMonths: task.intervalMonths, intervalKm: task.intervalKm, notes: task.notes }} />
  </VehicleEntryPage>;
}
