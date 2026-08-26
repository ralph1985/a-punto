"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/require-session";
import { DocumentKind, MaintenanceCategory } from "@/generated/prisma/client";

const odometerSchema = z.object({ vehicleId: z.string().min(1), valueKm: z.coerce.number().int().min(0).max(2_000_000) });

export async function updateOdometer(formData: FormData) {
  await requireSession();
  const data = odometerSchema.parse({ vehicleId: formData.get("vehicleId"), valueKm: formData.get("valueKm") });
  await db.odometerReading.create({ data: { ...data, note: "Lectura manual" } });
  revalidatePath("/"); revalidatePath("/coches");
}

const optionalInteger = z.preprocess((value) => value === "" || value === null ? null : Number(value), z.number().int().positive().nullable());
const optionalAmount = z.preprocess((value) => value === "" || value === null ? null : Number(value), z.number().nonnegative().nullable());
const maintenanceSchema = z.object({ vehicleId: z.string().min(1), title: z.string().trim().min(2), category: z.nativeEnum(MaintenanceCategory), serviceDate: z.coerce.date(), odometerKm: optionalInteger, cost: optionalAmount, providerName: z.string().trim().max(120), notes: z.string().trim().max(500), invoiceUrl: z.union([z.string().url(), z.literal("")]) });
const taskSchema = z.object({ vehicleId: z.string().min(1), title: z.string().trim().min(2), category: z.nativeEnum(MaintenanceCategory), intervalMonths: optionalInteger, intervalKm: optionalInteger, notes: z.string().trim().max(500) }).refine((data) => data.intervalMonths || data.intervalKm, "Indica un plazo en meses o kilómetros.");
const documentSchema = z.object({ vehicleId: z.string().min(1), kind: z.nativeEnum(DocumentKind), title: z.string().trim().min(2), url: z.union([z.string().url(), z.literal("")]), expiresAt: z.union([z.coerce.date(), z.literal("")]) });

function refresh(vehicleId: string) { revalidatePath("/"); revalidatePath("/coches"); revalidatePath("/costes"); revalidatePath(`/coches/${vehicleId}`); }

export async function createMaintenanceEvent(formData: FormData) {
  await requireSession();
  const data = maintenanceSchema.parse(Object.fromEntries(formData));
  const provider = data.providerName ? await db.serviceProvider.findFirst({ where: { name: data.providerName } }) ?? await db.serviceProvider.create({ data: { name: data.providerName } }) : null;
  await db.maintenanceEvent.create({ data: { vehicleId: data.vehicleId, providerId: provider?.id, title: data.title, category: data.category, serviceDate: data.serviceDate, odometerKm: data.odometerKm, cost: data.cost, notes: data.notes || null, invoiceUrl: data.invoiceUrl || null } });
  if (data.odometerKm) await db.odometerReading.create({ data: { vehicleId: data.vehicleId, valueKm: data.odometerKm, recordedAt: data.serviceDate, note: `Registrado con ${data.title}` } });
  refresh(data.vehicleId);
}

export async function createMaintenanceTask(formData: FormData) {
  await requireSession();
  const data = taskSchema.parse(Object.fromEntries(formData));
  const latest = await db.odometerReading.findFirst({ where: { vehicleId: data.vehicleId }, orderBy: { recordedAt: "desc" } });
  await db.maintenanceTask.create({ data: { vehicleId: data.vehicleId, title: data.title, category: data.category, intervalMonths: data.intervalMonths, intervalKm: data.intervalKm, baselineDate: new Date(), baselineOdometerKm: latest?.valueKm ?? null, notes: data.notes || null } });
  refresh(data.vehicleId);
}

export async function createDocumentLink(formData: FormData) {
  await requireSession();
  const data = documentSchema.parse(Object.fromEntries(formData));
  await db.documentLink.create({ data: { vehicleId: data.vehicleId, kind: data.kind, title: data.title, url: data.url || null, expiresAt: data.expiresAt || null } });
  refresh(data.vehicleId);
}
