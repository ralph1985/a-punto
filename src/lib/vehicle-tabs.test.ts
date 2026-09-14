import { describe, expect, it } from "vitest";
import { parseVehicleTab, vehicleTabHref } from "./vehicle-tabs";

describe("pestañas de vehículo", () => {
  it("usa el resumen cuando falta la pestaña o no es válida", () => {
    expect(parseVehicleTab(undefined)).toBe("resumen");
    expect(parseVehicleTab("desconocida")).toBe("resumen");
    expect(parseVehicleTab(["desconocida", "historial"])).toBe("resumen");
  });

  it("acepta las cuatro pestañas públicas", () => {
    expect(parseVehicleTab("resumen")).toBe("resumen");
    expect(parseVehicleTab("historial")).toBe("historial");
    expect(parseVehicleTab("itv")).toBe("itv");
    expect(parseVehicleTab("documentos")).toBe("documentos");
  });

  it("mantiene la ruta corta para el resumen y enlaza el resto por query string", () => {
    expect(vehicleTabHref("punto", "resumen")).toBe("/punto");
    expect(vehicleTabHref("punto", "historial")).toBe("/punto?tab=historial");
  });
});
