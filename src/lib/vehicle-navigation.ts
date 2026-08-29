export type VehicleNavigationMetadata = {
  slug: string;
  name: string;
  menuIcon: "CAR" | "VAN";
};

type VehicleNavigationCache = {
  savedAt: number;
  vehicles: VehicleNavigationMetadata[];
};

type VehicleNavigationStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const VEHICLE_NAVIGATION_CACHE_KEY = "a-punto:vehicle-navigation:v1";
export const VEHICLE_NAVIGATION_CACHE_TTL_MS = 10 * 60 * 1000;

function isVehicleNavigationMetadata(value: unknown): value is VehicleNavigationMetadata {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return Object.keys(record).length === 3
    && typeof record.slug === "string"
    && record.slug.length > 0
    && typeof record.name === "string"
    && record.name.length > 0
    && (record.menuIcon === "CAR" || record.menuIcon === "VAN");
}

export function parseVehicleNavigationMetadata(value: unknown): VehicleNavigationMetadata[] | null {
  if (!Array.isArray(value) || !value.every(isVehicleNavigationMetadata)) return null;
  return value;
}

function parseVehicleNavigationCache(value: unknown): VehicleNavigationCache | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const vehicles = parseVehicleNavigationMetadata(record.vehicles);
  if (Object.keys(record).length !== 2 || !Number.isFinite(record.savedAt) || !vehicles) return null;

  return { savedAt: record.savedAt as number, vehicles };
}

export function readVehicleNavigationCache(
  storage: VehicleNavigationStorage | undefined,
  now = Date.now(),
): VehicleNavigationMetadata[] | null {
  if (!storage) return null;

  try {
    const raw = storage.getItem(VEHICLE_NAVIGATION_CACHE_KEY);
    if (!raw) return null;

    const cache = parseVehicleNavigationCache(JSON.parse(raw));
    if (!cache || now - cache.savedAt < 0 || now - cache.savedAt >= VEHICLE_NAVIGATION_CACHE_TTL_MS) {
      storage.removeItem(VEHICLE_NAVIGATION_CACHE_KEY);
      return null;
    }

    return cache.vehicles;
  } catch {
    try {
      storage.removeItem(VEHICLE_NAVIGATION_CACHE_KEY);
    } catch {
      // Storage may be unavailable or may reject all operations.
    }
    return null;
  }
}

export function writeVehicleNavigationCache(
  storage: VehicleNavigationStorage | undefined,
  vehicles: VehicleNavigationMetadata[],
  savedAt = Date.now(),
) {
  if (!storage) return;

  try {
    storage.setItem(VEHICLE_NAVIGATION_CACHE_KEY, JSON.stringify({ savedAt, vehicles }));
  } catch {
    // A full or disabled sessionStorage must not break the navigation.
  }
}
