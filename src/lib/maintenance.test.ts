import { describe, expect, it } from "vitest";
import { evaluateTask } from "./maintenance";

const now = new Date("2026-08-27T00:00:00.000Z");

describe("evaluación de mantenimiento", () => {
  it("pide el odómetro para una tarea basada solo en kilómetros", () => {
    const result = evaluateTask({ intervalMonths: null, intervalKm: 10_000, baselineDate: null, baselineOdometerKm: 50_000, fixedDueDate: null }, null, now);

    expect(result.status).toBe("needs-odometer");
    expect(result.dueKm).toBe(60_000);
    expect(result.reasons).toContain("Registra el odómetro para evaluar los kilómetros");
  });

  it("marca como próximo un vencimiento por fecha", () => {
    const result = evaluateTask({ intervalMonths: null, intervalKm: null, baselineDate: null, baselineOdometerKm: null, fixedDueDate: new Date("2026-09-01T00:00:00.000Z") }, null, now);

    expect(result.status).toBe("soon");
    expect(result.reasons).toContain("En 5 días");
  });

  it("marca como vencida una tarea superada por kilómetros", () => {
    const result = evaluateTask({ intervalMonths: null, intervalKm: 10_000, baselineDate: null, baselineOdometerKm: 50_000, fixedDueDate: null }, 60_001, now);

    expect(result.status).toBe("overdue");
    expect(result.reasons).toContain("Superada por 1 km");
  });

  it("marca como no programada una tarea sin plazo", () => {
    const result = evaluateTask({ intervalMonths: null, intervalKm: null, baselineDate: null, baselineOdometerKm: null, fixedDueDate: null }, null, now);

    expect(result.status).toBe("unscheduled");
    expect(result.reasons).toEqual([]);
  });
});
