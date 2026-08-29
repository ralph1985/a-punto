import { describe, expect, it, vi } from "vitest";
import {
  readVehicleNavigationCache,
  VEHICLE_NAVIGATION_CACHE_KEY,
  VEHICLE_NAVIGATION_CACHE_TTL_MS,
  writeVehicleNavigationCache,
  type VehicleNavigationMetadata,
} from "./vehicle-navigation";

const vehicles: VehicleNavigationMetadata[] = [{ slug: "punto", name: "Punto", menuIcon: "CAR" }];

function createStorage(initial?: string): Storage {
  let value = initial ?? null;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key, nextValue) => { value = nextValue; }),
    removeItem: vi.fn(() => { value = null; }),
  } as unknown as Storage;
}

describe("caché de metadatos de navegación", () => {
  it("usa una caché válida durante diez minutos", () => {
    const storage = createStorage();
    writeVehicleNavigationCache(storage, vehicles, 1_000);

    expect(readVehicleNavigationCache(storage, 1_000 + VEHICLE_NAVIGATION_CACHE_TTL_MS - 1)).toEqual(vehicles);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("descarta una caché caducada", () => {
    const storage = createStorage();
    writeVehicleNavigationCache(storage, vehicles, 1_000);

    expect(readVehicleNavigationCache(storage, 1_000 + VEHICLE_NAVIGATION_CACHE_TTL_MS)).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(VEHICLE_NAVIGATION_CACHE_KEY);
  });

  it("descarta una caché corrupta", () => {
    const storage = createStorage("{no es json");

    expect(readVehicleNavigationCache(storage, 1_000)).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(VEHICLE_NAVIGATION_CACHE_KEY);
  });

  it("tolera que sessionStorage no esté disponible", () => {
    expect(readVehicleNavigationCache(undefined, 1_000)).toBeNull();
    expect(() => writeVehicleNavigationCache(undefined, vehicles, 1_000)).not.toThrow();
  });
});
