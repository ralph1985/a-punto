export type MaintenanceTaskSchedule = { intervalMonths: number | null; intervalKm: number | null; baselineDate: Date | null; baselineOdometerKm: number | null; fixedDueDate: Date | null };
export type TaskStatus = "overdue" | "soon" | "upcoming" | "needs-odometer" | "unscheduled";
const SOON_DAYS = 90;

function addMonths(date: Date, months: number) {
  const result = new Date(date); result.setUTCMonth(result.getUTCMonth() + months); return result;
}

export function evaluateTask(task: MaintenanceTaskSchedule, currentKm: number | null, now = new Date()) {
  const dueDate = task.fixedDueDate ?? (task.intervalMonths && task.baselineDate ? addMonths(task.baselineDate, task.intervalMonths) : null);
  const dueKm = task.intervalKm && task.baselineOdometerKm !== null ? task.baselineOdometerKm + task.intervalKm : null;
  const dateDelta = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / 86_400_000) : null;
  const kmDelta = dueKm !== null && currentKm !== null ? dueKm - currentKm : null;
  const overdue = (dateDelta !== null && dateDelta < 0) || (kmDelta !== null && kmDelta < 0);
  const soon = (dateDelta !== null && dateDelta <= SOON_DAYS) || (kmDelta !== null && kmDelta <= 1000);
  const status: TaskStatus = overdue ? "overdue" : soon ? "soon" : dueDate || dueKm ? "upcoming" : dueKm !== null ? "needs-odometer" : "unscheduled";
  const reasons = [dateDelta !== null ? dateDelta < 0 ? `Vencida hace ${Math.abs(dateDelta)} días` : `En ${dateDelta} días` : null, kmDelta !== null ? kmDelta < 0 ? `Superada por ${Math.abs(kmDelta).toLocaleString("es-ES")} km` : `Faltan ${kmDelta.toLocaleString("es-ES")} km` : null].filter(Boolean) as string[];
  return { status, dueDate, dueKm, reasons };
}
