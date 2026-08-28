import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type VehicleRouteSlug = string;

export function getVehicleSlug(vehicle: { slug: string }): VehicleRouteSlug {
  return vehicle.slug;
}

export const vehicleDetailInclude = {
  maintenanceEvents: { include: { provider: true }, orderBy: { serviceDate: "desc" } },
  maintenanceTasks: { where: { isActive: true } },
  documents: true,
  insurancePolicies: true,
} satisfies Prisma.VehicleInclude;

export type VehicleDetail = Prisma.VehicleGetPayload<{ include: typeof vehicleDetailInclude }>;

export async function getVehiclesForNavigation() {
  return db.vehicle.findMany({
    select: { slug: true, name: true, menuIcon: true },
    orderBy: [{ year: "asc" }, { brand: "asc" }, { name: "asc" }],
  });
}

export async function getVehicleBySlug(slug: VehicleRouteSlug) {
  return db.vehicle.findUnique({ where: { slug }, include: vehicleDetailInclude });
}

export async function getVehicleById(id: string) {
  return db.vehicle.findUnique({ where: { id }, select: { slug: true } });
}
