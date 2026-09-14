import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MaintenanceTaskForm } from "@/components/vehicle-entry-forms";
import { VehicleEntryPage } from "@/components/vehicle-entry-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";
import { parseVehicleTab, vehicleTabHref } from "@/lib/vehicle-tabs";

export default async function EditMaintenanceTaskPage({ params, searchParams }: { params: Promise<{ vehicle: string; id: string }>; searchParams: Promise<{ from?: string | string[] }> }) {
  await requireSession();
  const { vehicle: slug, id } = await params;
  const { from } = await searchParams;
  const returnTab = parseVehicleTab(from);
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const task = await db.maintenanceTask.findFirst({ where: { id, vehicleId: vehicle.id } });
  if (!task) notFound();

  return <VehicleEntryPage vehicle={vehicle} returnTab={returnTab} title="Editar mantenimiento" description={`Actualiza la regla de mantenimiento de ${vehicle.name}.`}>
    <MaintenanceTaskForm vehicleId={vehicle.id} backHref={vehicleTabHref(vehicle.slug, returnTab)} editing initial={{ id: task.id, title: task.title, category: task.category, intervalMonths: task.intervalMonths, intervalKm: task.intervalKm, notes: task.notes }} />
  </VehicleEntryPage>;
}
