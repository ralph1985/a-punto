import { describe, expect, it } from "vitest";
import { filterHistory, groupHistory, historySummary, historyYears, parseHistoryFilters, vehicleHistoryHref, type HistoryEvent } from "./vehicle-history";

function event(overrides: Record<string, unknown> = {}) {
  return {
    id: "event-1",
    vehicleId: "vehicle-1",
    taskId: null,
    providerId: null,
    title: "Revisión general",
    category: "MAINTENANCE",
    serviceDate: new Date("2025-06-15T12:00:00.000Z"),
    odometerKm: null,
    cost: null,
    notes: null,
    invoiceUrl: null,
    createdAt: new Date("2025-06-15T12:00:00.000Z"),
    updatedAt: new Date("2025-06-15T12:00:00.000Z"),
    provider: null,
    ...overrides,
  } as unknown as HistoryEvent;
}

describe("historial de intervenciones", () => {
  it("parsea solo filtros reconocidos y limpia la búsqueda", () => {
    expect(parseHistoryFilters({ year: "2025", category: "TIRES", q: "  aceite  " })).toEqual({ year: 2025, category: "TIRES", query: "aceite" });
    expect(parseHistoryFilters({ year: "no-es-año", category: "UNKNOWN", q: "  " })).toEqual({ year: undefined, category: undefined, query: undefined });
  });

  it("filtra por año, categoría y texto sin distinguir acentos", () => {
    const events = [
      event({ id: "oil", title: "Cambio de aceite", category: "MAINTENANCE", serviceDate: new Date("2025-03-02T12:00:00.000Z"), provider: { name: "Taller García" } }),
      event({ id: "tires", title: "Neumáticos delanteros", category: "TIRES", serviceDate: new Date("2024-09-10T12:00:00.000Z"), notes: "Revisión de presión" }),
    ];

    expect(filterHistory(events, { year: 2025, query: "garcia" }).map(({ id }) => id)).toEqual(["oil"]);
    expect(filterHistory(events, { category: "TIRES", query: "revision" }).map(({ id }) => id)).toEqual(["tires"]);
  });

  it("agrupa años en orden descendente y calcula el resumen", () => {
    const events = [
      event({ id: "new", serviceDate: new Date("2026-03-02T12:00:00.000Z"), cost: 45 }),
      event({ id: "old", serviceDate: new Date("2024-03-02T12:00:00.000Z"), cost: 120 }),
    ];

    expect(groupHistory(events).map(({ year }) => year)).toEqual([2026, 2024]);
    expect(historyYears(events)).toEqual([2026, 2024]);
    expect(historySummary(events)).toMatchObject({ count: 2, costCount: 2, totalCost: 165 });
  });

  it("genera enlaces de historial compartibles y seguros", () => {
    expect(vehicleHistoryHref("punto", { year: 2025, category: "TIRES", query: "aceite y filtro" })).toBe("/punto?tab=historial&year=2025&category=TIRES&q=aceite+y+filtro");
  });
});
