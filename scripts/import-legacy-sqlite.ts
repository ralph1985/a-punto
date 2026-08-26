import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, MaintenanceCategory, DocumentKind } from "../src/generated/prisma/client";

type Row = Record<string, unknown>;
type SQLiteDatabase = { prepare(sql: string): { all(): Row[] }; close(): void };
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Node 22 exposes SQLite before its installed type definitions.
const { DatabaseSync } = require("node:sqlite") as { DatabaseSync: new (filename: string, options: { readOnly: boolean }) => SQLiteDatabase };

const source = process.env.LEGACY_SQLITE_PATH ?? "/home/rafa/tailscale/dev-20260618-085601.db";
const write = process.argv.includes("--write");

dotenv.config({ path: ".env.local" });
dotenv.config();

if (!existsSync(source)) throw new Error(`No existe la copia SQLite: ${source}`);

function date(value: unknown) { return value ? new Date(String(value)) : null; }
function decimal(value: unknown) { return value === null || value === undefined ? null : String(value); }
function json(row: Row) { return JSON.parse(JSON.stringify(row)); }
function category(title: string): MaintenanceCategory {
  const normalized = title.toLocaleLowerCase("es");
  if (normalized.includes("itv") || normalized.includes("inspecci")) return MaintenanceCategory.INSPECTION;
  if (normalized.includes("rueda") || normalized.includes("neum") || normalized.includes("pinchazo")) return MaintenanceCategory.TIRES;
  if (normalized.includes("revisi") || normalized.includes("aceite") || normalized.includes("filtro") || normalized.includes("buj")) return MaintenanceCategory.MAINTENANCE;
  if (normalized.includes("seguro")) return MaintenanceCategory.INSURANCE;
  return MaintenanceCategory.REPAIR;
}

const sqlite = new DatabaseSync(source, { readOnly: true });
const read = (table: string) => sqlite.prepare(`SELECT * FROM "${table}"`).all();
const sourceData = {
  vehicles: read("Vehicle"), workshops: read("Workshop"), maintenance: read("VehicleMaintenance"),
  plans: read("VehicleMaintenancePlan"), planItems: read("VehicleMaintenancePlanItem"), insurance: read("VehicleInsurance"),
  purchases: read("VehiclePurchase"), registrations: read("VehicleRegistrationDocument"), specs: read("VehicleSpecs"),
};
sqlite.close();

console.log(JSON.stringify({ source, mode: write ? "write" : "dry-run", counts: Object.fromEntries(Object.entries(sourceData).map(([key, rows]) => [key, rows.length])) }, null, 2));
if (!write) process.exit(0);

if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL para escribir la importación.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

async function imported(sourceTable: string, sourceId: unknown) {
  return db.importRecord.findUnique({ where: { sourceTable_sourceId: { sourceTable, sourceId: String(sourceId) } } });
}

async function mark(sourceTable: string, sourceId: unknown, payload: Row, vehicleId?: string) {
  return db.importRecord.create({ data: { sourceTable, sourceId: String(sourceId), payload: json(payload), vehicleId } });
}

async function main() {
  const vehicles = new Map<number, string>();
  const workshops = new Map<number, string>();
  const plans = new Map<number, { vehicleId: string; startDate: Date | null }>();

  for (const row of sourceData.vehicles) {
    const existing = await imported("Vehicle", row.id);
    if (existing?.vehicleId) { vehicles.set(Number(row.id), existing.vehicleId); continue; }
    const vehicle = await db.vehicle.create({ data: { name: String(row.name ?? `${row.brand} ${row.model}`), brand: String(row.brand), model: String(row.model), year: row.year ? Number(row.year) : null, licensePlate: row.licensePlate ? String(row.licensePlate) : null, vin: row.vin ? String(row.vin) : null, notes: row.notes ? String(row.notes) : null } });
    await mark("Vehicle", row.id, row, vehicle.id);
    vehicles.set(Number(row.id), vehicle.id);
  }

  for (const row of sourceData.workshops) {
    const existing = await imported("Workshop", row.id);
    if (existing) {
      const provider = await db.serviceProvider.findFirst({ where: { name: String(row.name) } });
      if (!provider) throw new Error(`No se encontró el taller importado ${row.name}.`);
      workshops.set(Number(row.id), provider.id);
      continue;
    }
    const provider = await db.serviceProvider.create({ data: { name: String(row.name), taxId: row.taxId ? String(row.taxId) : null, phone: row.phone ? String(row.phone) : null, email: row.email ? String(row.email) : null, address: [row.addressLine, row.postalCode, row.city, row.region, row.country].filter(Boolean).join(", ") || null, notes: row.notes ? String(row.notes) : null } });
    await mark("Workshop", row.id, row);
    workshops.set(Number(row.id), provider.id);
  }

  for (const row of sourceData.maintenance) {
    const existing = await imported("VehicleMaintenance", row.id);
    if (existing) continue;
    const vehicleId = vehicles.get(Number(row.vehicleId));
    if (!vehicleId) throw new Error(`Mantenimiento ${row.id} sin vehículo.`);
    const event = await db.maintenanceEvent.create({ data: { vehicleId, providerId: row.workshopId ? workshops.get(Number(row.workshopId)) ?? null : null, title: String(row.title), category: category(String(row.title)), serviceDate: date(row.serviceDate) ?? new Date(), odometerKm: row.odometerKm ? Number(row.odometerKm) : null, cost: decimal(row.cost), notes: row.description ? String(row.description) : null, invoiceUrl: row.invoiceUrl ? String(row.invoiceUrl) : null } });
    await mark("VehicleMaintenance", row.id, row, vehicleId);
    if (event.odometerKm) await db.odometerReading.create({ data: { vehicleId, valueKm: event.odometerKm, recordedAt: event.serviceDate, note: `Importado de mantenimiento: ${event.title}` } });
  }

  for (const row of sourceData.plans) {
    const vehicleId = vehicles.get(Number(row.vehicleId));
    if (vehicleId) plans.set(Number(row.id), { vehicleId, startDate: date(row.startDate) });
  }
  for (const row of sourceData.planItems) {
    if (await imported("VehicleMaintenancePlanItem", row.id)) continue;
    const plan = plans.get(Number(row.planId));
    if (!plan) continue;
    await db.maintenanceTask.create({ data: { vehicleId: plan.vehicleId, title: String(row.title), category: category(String(row.title)), intervalMonths: row.intervalMonths ? Number(row.intervalMonths) : null, intervalKm: row.intervalKmMax ? Number(row.intervalKmMax) : row.intervalKmMin ? Number(row.intervalKmMin) : null, baselineDate: plan.startDate, notes: row.notes ? String(row.notes) : null } });
    await mark("VehicleMaintenancePlanItem", row.id, row, plan.vehicleId);
  }

  for (const row of sourceData.insurance) {
    if (await imported("VehicleInsurance", row.id)) continue;
    const vehicleId = vehicles.get(Number(row.vehicleId)); if (!vehicleId) continue;
    await db.insurancePolicy.create({ data: { vehicleId, policyNumber: row.policyNumber ? String(row.policyNumber) : null, effectiveAt: date(row.effectiveDate), expiresAt: date(row.expiryDate), premium: decimal(row.premiumTotal), paymentFrequency: row.paymentFrequency ? String(row.paymentFrequency) : null, documentUrl: row.documentUrl ? String(row.documentUrl) : null, details: json(row) } });
    await mark("VehicleInsurance", row.id, row, vehicleId);
  }

  for (const row of sourceData.purchases) {
    if (await imported("VehiclePurchase", row.id)) continue;
    const vehicleId = vehicles.get(Number(row.vehicleId)); if (!vehicleId) continue;
    await db.vehiclePurchase.create({ data: { vehicleId, dealerName: row.dealerName ? String(row.dealerName) : null, offerDate: date(row.offerIssueDate), totalToPay: decimal(row.totalToPay), details: json(row) } });
    await mark("VehiclePurchase", row.id, row, vehicleId);
  }

  for (const row of sourceData.registrations) {
    if (await imported("VehicleRegistrationDocument", row.id)) continue;
    const vehicleId = vehicles.get(Number(row.vehicleId)); if (!vehicleId) continue;
    await db.documentLink.create({ data: { vehicleId, kind: DocumentKind.REGISTRATION, title: String(row.documentType ?? "Documento de matriculación"), url: row.verificationUrl ? String(row.verificationUrl) : null, issuedAt: date(row.issueDate), expiresAt: date(row.validUntil), details: json(row) } });
    await mark("VehicleRegistrationDocument", row.id, row, vehicleId);
  }

  for (const row of sourceData.specs) {
    if (await imported("VehicleSpecs", row.id)) continue;
    const vehicleId = vehicles.get(Number(row.vehicleId)); if (!vehicleId) continue;
    await db.documentLink.create({ data: { vehicleId, kind: DocumentKind.TECHNICAL_SPECS, title: "Ficha técnica", details: json(row) } });
    await mark("VehicleSpecs", row.id, row, vehicleId);
  }
  console.log("Importación completada sin duplicados.");
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
