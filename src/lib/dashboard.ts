import { db } from "./db";
import { evaluateTask } from "./maintenance";

export async function getDashboard() {
  const vehicles = await db.vehicle.findMany({
    orderBy: [{ year: "asc" }, { brand: "asc" }],
    include: { odometerReadings: { orderBy: { recordedAt: "desc" }, take: 1 }, maintenanceTasks: { where: { isActive: true }, orderBy: { updatedAt: "desc" } } },
  });
  return vehicles.map((vehicle) => {
    const odometer = vehicle.odometerReadings[0]?.valueKm ?? null;
    const tasks = vehicle.maintenanceTasks.map((task) => ({ ...task, evaluation: evaluateTask(task, odometer) })).sort((a, b) => a.evaluation.status.localeCompare(b.evaluation.status));
    return { ...vehicle, odometer, tasks };
  });
}
