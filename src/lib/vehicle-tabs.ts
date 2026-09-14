export const vehicleTabs = [
  { id: "resumen", label: "Resumen" },
  { id: "historial", label: "Historial" },
  { id: "itv", label: "ITV" },
  { id: "documentos", label: "Documentos" },
] as const;

export type VehicleTab = (typeof vehicleTabs)[number]["id"];
export type VehicleTabQueryValue = string | string[] | undefined;

export function parseVehicleTab(value: VehicleTabQueryValue): VehicleTab {
  const candidate = Array.isArray(value) ? value[0] : value;
  return vehicleTabs.some((tab) => tab.id === candidate) ? candidate as VehicleTab : "resumen";
}

export function vehicleTabHref(slug: string, tab: VehicleTab) {
  return tab === "resumen" ? `/${slug}` : `/${slug}?tab=${tab}`;
}
