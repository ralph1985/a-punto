import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export const vehicleRoutes = {
  punto: "Punto",
  rifter: "Rifter",
} as const;

export type VehicleRouteSlug = keyof typeof vehicleRoutes;

export function isVehicleRouteSlug(value: string): value is VehicleRouteSlug {
  return value in vehicleRoutes;
}

export function getVehicleSlug(vehicle: { name: string; model: string }): VehicleRouteSlug | null {
  const identity = `${vehicle.name} ${vehicle.model}`.toLocaleLowerCase("es-ES");
  return (Object.keys(vehicleRoutes) as VehicleRouteSlug[]).find((slug) => identity.includes(slug)) ?? null;
}

export const vehicleDetailInclude = {
  maintenanceEvents: { include: { provider: true }, orderBy: { serviceDate: "desc" } },
  maintenanceTasks: { where: { isActive: true } },
  documents: true,
  insurancePolicies: true,
} satisfies Prisma.VehicleInclude;

export type VehicleDetail = Prisma.VehicleGetPayload<{ include: typeof vehicleDetailInclude }>;

export async function getVehicleBySlug(slug: VehicleRouteSlug) {
  const vehicles = await db.vehicle.findMany({ include: vehicleDetailInclude });
  return vehicles.find((vehicle) => getVehicleSlug(vehicle) === slug) ?? null;
}

export async function getVehicleById(id: string) {
  return db.vehicle.findUnique({ where: { id }, select: { name: true, model: true } });
}
