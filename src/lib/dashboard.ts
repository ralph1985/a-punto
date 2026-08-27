import { db } from "./db";
import { evaluateTask, type TaskStatus } from "./maintenance";
import { getVehicleSlug } from "./vehicle-routes";

const taskStatusOrder: Record<TaskStatus, number> = { overdue: 0, soon: 1, "needs-odometer": 2, upcoming: 3, unscheduled: 4 };

export async function getDashboard() {
  const vehicles = await db.vehicle.findMany({
    orderBy: [{ year: "asc" }, { brand: "asc" }],
    include: { odometerReadings: { orderBy: { recordedAt: "desc" }, take: 1 }, maintenanceTasks: { where: { isActive: true }, orderBy: { updatedAt: "desc" } } },
  });
  return vehicles.map((vehicle) => {
    const odometer = vehicle.odometerReadings[0]?.valueKm ?? null;
    const scheduledTasks = vehicle.itvExpiresAt ? [...vehicle.maintenanceTasks, { id: `itv-${vehicle.id}`, title: "ITV", category: "INSPECTION" as const, isActive: true, intervalMonths: null, intervalKm: null, baselineDate: null, baselineOdometerKm: null, fixedDueDate: vehicle.itvExpiresAt, notes: null, createdAt: vehicle.createdAt, updatedAt: vehicle.updatedAt, vehicleId: vehicle.id }] : vehicle.maintenanceTasks;
    const tasks = scheduledTasks.map((task) => ({ ...task, evaluation: evaluateTask(task, odometer) })).sort((a, b) => taskStatusOrder[a.evaluation.status] - taskStatusOrder[b.evaluation.status]);
    return { ...vehicle, slug: getVehicleSlug(vehicle), odometer, tasks };
  });
}
