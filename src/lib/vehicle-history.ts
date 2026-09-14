import type { VehicleDetail } from "@/lib/vehicle-routes";

export type HistoryEvent = VehicleDetail["maintenanceEvents"][number];
export type HistoryCategory = HistoryEvent["category"];

export type HistoryFilters = {
  year?: number;
  category?: HistoryCategory;
  query?: string;
};

type HistorySearchParams = {
  year?: string | string[];
  category?: string | string[];
  q?: string | string[];
};

export const historyCategoryValues: HistoryCategory[] = ["MAINTENANCE", "REPAIR", "INSPECTION", "TIRES", "INSURANCE", "OTHER"];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseHistoryFilters(params: HistorySearchParams): HistoryFilters {
  const yearValue = firstParam(params.year);
  const year = yearValue && /^\d{4}$/.test(yearValue) ? Number(yearValue) : undefined;
  const categoryValue = firstParam(params.category);
  const category = historyCategoryValues.includes(categoryValue as HistoryCategory) ? categoryValue as HistoryCategory : undefined;
  const query = firstParam(params.q)?.trim() || undefined;

  return { year, category, query };
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-ES");
}

export function filterHistory(events: HistoryEvent[], filters: HistoryFilters) {
  const query = filters.query ? normalize(filters.query) : null;

  return events.filter((event) => {
    if (filters.year !== undefined && event.serviceDate.getUTCFullYear() !== filters.year) return false;
    if (filters.category !== undefined && event.category !== filters.category) return false;
    if (query) {
      const searchable = normalize([event.title, event.provider?.name, event.notes].filter(Boolean).join(" "));
      if (!searchable.includes(query)) return false;
    }
    return true;
  });
}

export function groupHistory(events: HistoryEvent[]) {
  const groups = new Map<number, HistoryEvent[]>();
  for (const event of events) {
    const year = event.serviceDate.getUTCFullYear();
    const current = groups.get(year) ?? [];
    current.push(event);
    groups.set(year, current);
  }
  return [...groups.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, yearEvents]) => ({ year, events: yearEvents }));
}

export function historyYears(events: HistoryEvent[]) {
  return [...new Set(events.map((event) => event.serviceDate.getUTCFullYear()))].sort((yearA, yearB) => yearB - yearA);
}

export function historySummary(events: HistoryEvent[]) {
  const costedEvents = events.filter((event) => event.cost !== null);
  return {
    count: events.length,
    costCount: costedEvents.length,
    totalCost: costedEvents.reduce((sum, event) => sum + Number(event.cost), 0),
    firstDate: events.length > 0 ? events[events.length - 1].serviceDate : null,
    lastDate: events.length > 0 ? events[0].serviceDate : null,
  };
}

function historyParams(filters: HistoryFilters, firstKey: "tab" | "from") {
  const params = new URLSearchParams();
  params.set(firstKey, "historial");
  if (filters.year !== undefined) params.set("year", String(filters.year));
  if (filters.category !== undefined) params.set("category", filters.category);
  if (filters.query) params.set("q", filters.query);
  return params;
}

export function vehicleHistoryHref(vehicleSlug: string, filters: HistoryFilters = {}) {
  return `/${vehicleSlug}?${historyParams(filters, "tab").toString()}`;
}

export function historyReturnQuery(filters: HistoryFilters = {}) {
  return historyParams(filters, "from").toString();
}
