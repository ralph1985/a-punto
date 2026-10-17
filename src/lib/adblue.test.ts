import { describe, expect, it } from "vitest";
import { calculateAdBlueCost, formatAdBlueRefillMeta } from "./adblue";

describe("registros de AdBlue", () => {
  it("calcula el coste con dos decimales", () => {
    expect(calculateAdBlueCost(7.27, 1.649)).toBe(11.99);
  });

  it("prepara el resumen visible del repostaje", () => {
    expect(formatAdBlueRefillMeta({ litres: 7.27, unitPrice: 1.649, odometerKm: 12400, remainingRangeKm: 800 })).toBe("7,27 L · 1,649 €/L · 12.400 km · quedaban 800 km");
  });
});
