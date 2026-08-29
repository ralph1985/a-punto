"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/require-session";
import { DocumentKind, MaintenanceCategory } from "@/generated/prisma/client";

export type FormState = { error?: string; success?: string };

const odometerSchema = z.object({ vehicleId: z.string().min(1), valueKm: z.coerce.number().int().min(0).max(2_000_000) });

class ActionError extends Error {}

async function requireVehicle(vehicleId: string) {
  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true, slug: true } });
  if (!vehicle) throw new ActionError("El vehículo indicado no existe.");
  return vehicle;
}

function actionError(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "Revisa los datos introducidos.";
  if (error instanceof ActionError) return error.message;
  return "No se ha podido guardar. Inténtalo de nuevo.";
}

export async function updateOdometer(_previousState: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  try {
    const data = odometerSchema.parse({ vehicleId: formData.get("vehicleId"), valueKm: formData.get("valueKm") });
    const vehicle = await requireVehicle(data.vehicleId);
    await db.odometerReading.create({ data: { ...data, note: "Lectura manual" } });
    refresh(vehicle.slug);
    return { success: "Lectura guardada." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

const optionalInteger = z.preprocess((value) => value === "" || value === null ? null : Number(value), z.number().int().positive().nullable());
const optionalAmount = z.preprocess((value) => value === "" || value === null ? null : Number(value), z.number().nonnegative().nullable());
const maintenanceSchema = z.object({ vehicleId: z.string().min(1), title: z.string().trim().min(2), category: z.nativeEnum(MaintenanceCategory), serviceDate: z.coerce.date(), odometerKm: optionalInteger, cost: optionalAmount, providerName: z.string().trim().max(120), notes: z.string().trim().max(500), invoiceUrl: z.union([z.string().url(), z.literal("")]) });
const taskSchema = z.object({ vehicleId: z.string().min(1), title: z.string().trim().min(2), category: z.nativeEnum(MaintenanceCategory), intervalMonths: optionalInteger, intervalKm: optionalInteger, notes: z.string().trim().max(500) }).refine((data) => data.intervalMonths || data.intervalKm, "Indica un plazo en meses o kilómetros.");
const documentSchema = z.object({ vehicleId: z.string().min(1), kind: z.nativeEnum(DocumentKind), title: z.string().trim().min(2), url: z.union([z.string().url(), z.literal("")]), expiresAt: z.union([z.coerce.date(), z.literal("")]) });

function refresh(vehicleSlug: string) { revalidatePath("/"); revalidatePath(`/${vehicleSlug}`); }

export async function createMaintenanceEvent(_previousState: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  try {
    const data = maintenanceSchema.parse(Object.fromEntries(formData));
    const vehicle = await requireVehicle(data.vehicleId);
    await db.$transaction(async (transaction) => {
      const provider = data.providerName ? await transaction.serviceProvider.findFirst({ where: { name: data.providerName } }) ?? await transaction.serviceProvider.create({ data: { name: data.providerName } }) : null;
      await transaction.maintenanceEvent.create({ data: { vehicleId: data.vehicleId, providerId: provider?.id, title: data.title, category: data.category, serviceDate: data.serviceDate, odometerKm: data.odometerKm, cost: data.cost, notes: data.notes || null, invoiceUrl: data.invoiceUrl || null } });
      if (data.odometerKm !== null) await transaction.odometerReading.create({ data: { vehicleId: data.vehicleId, valueKm: data.odometerKm, recordedAt: data.serviceDate, note: `Registrado con ${data.title}` } });
    });
    refresh(vehicle.slug);
    return { success: "Intervención guardada." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function createMaintenanceTask(_previousState: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  try {
    const data = taskSchema.parse(Object.fromEntries(formData));
    const vehicle = await requireVehicle(data.vehicleId);
    const latest = await db.odometerReading.findFirst({ where: { vehicleId: data.vehicleId }, orderBy: { recordedAt: "desc" } });
    await db.maintenanceTask.create({ data: { vehicleId: data.vehicleId, title: data.title, category: data.category, intervalMonths: data.intervalMonths, intervalKm: data.intervalKm, baselineDate: new Date(), baselineOdometerKm: latest?.valueKm ?? null, notes: data.notes || null } });
    refresh(vehicle.slug);
    return { success: "Regla guardada." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function createDocumentLink(_previousState: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  try {
    const data = documentSchema.parse(Object.fromEntries(formData));
    const vehicle = await requireVehicle(data.vehicleId);
    await db.documentLink.create({ data: { vehicleId: data.vehicleId, kind: data.kind, title: data.title, url: data.url || null, expiresAt: data.expiresAt || null } });
    refresh(vehicle.slug);
    return { success: "Enlace guardado." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

const maintenanceUpdateSchema = maintenanceSchema.extend({ id: z.string().min(1) });
const taskUpdateSchema = taskSchema.extend({ id: z.string().min(1) });
const documentUpdateSchema = documentSchema.extend({ id: z.string().min(1) });
const taskDeactivateSchema = z.object({ id: z.string().min(1), vehicleId: z.string().min(1) });

export async function updateMaintenanceEvent(_previousState: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  try {
    const data = maintenanceUpdateSchema.parse(Object.fromEntries(formData));
    const vehicle = await requireVehicle(data.vehicleId);
    const existing = await db.maintenanceEvent.findFirst({ where: { id: data.id, vehicleId: data.vehicleId } });
    if (!existing) throw new ActionError("La intervención indicada no existe.");

    await db.$transaction(async (transaction) => {
      const provider = data.providerName ? await transaction.serviceProvider.findFirst({ where: { name: data.providerName } }) ?? await transaction.serviceProvider.create({ data: { name: data.providerName } }) : null;
      await transaction.maintenanceEvent.update({ where: { id: data.id }, data: { providerId: provider?.id ?? null, title: data.title, category: data.category, serviceDate: data.serviceDate, odometerKm: data.odometerKm, cost: data.cost, notes: data.notes || null, invoiceUrl: data.invoiceUrl || null } });

      const derivedReading = existing.odometerKm !== null ? await transaction.odometerReading.findFirst({ where: { vehicleId: data.vehicleId, valueKm: existing.odometerKm, recordedAt: existing.serviceDate, note: { startsWith: "Registrado con " } } }) : null;
      if (derivedReading) {
        if (data.odometerKm === null) {
          await transaction.odometerReading.delete({ where: { id: derivedReading.id } });
        } else {
          await transaction.odometerReading.update({ where: { id: derivedReading.id }, data: { valueKm: data.odometerKm, recordedAt: data.serviceDate, note: `Registrado con ${data.title}` } });
        }
      } else if (data.odometerKm !== null) {
        await transaction.odometerReading.create({ data: { vehicleId: data.vehicleId, valueKm: data.odometerKm, recordedAt: data.serviceDate, note: `Registrado con ${data.title}` } });
      }
    });
    refresh(vehicle.slug);
    return { success: "Intervención actualizada." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function updateMaintenanceTask(_previousState: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  try {
    const data = taskUpdateSchema.parse(Object.fromEntries(formData));
    const vehicle = await requireVehicle(data.vehicleId);
    const existing = await db.maintenanceTask.findFirst({ where: { id: data.id, vehicleId: data.vehicleId } });
    if (!existing) throw new ActionError("La regla indicada no existe.");
    await db.maintenanceTask.update({ where: { id: data.id }, data: { title: data.title, category: data.category, intervalMonths: data.intervalMonths, intervalKm: data.intervalKm, notes: data.notes || null } });
    refresh(vehicle.slug);
    return { success: "Regla actualizada." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function updateDocumentLink(_previousState: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  try {
    const data = documentUpdateSchema.parse(Object.fromEntries(formData));
    const vehicle = await requireVehicle(data.vehicleId);
    const existing = await db.documentLink.findFirst({ where: { id: data.id, vehicleId: data.vehicleId } });
    if (!existing) throw new ActionError("El enlace indicado no existe.");
    await db.documentLink.update({ where: { id: data.id }, data: { kind: data.kind, title: data.title, url: data.url || null, expiresAt: data.expiresAt || null } });
    refresh(vehicle.slug);
    return { success: "Enlace actualizado." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function deactivateMaintenanceTask(_previousState: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  try {
    const data = taskDeactivateSchema.parse(Object.fromEntries(formData));
    const vehicle = await requireVehicle(data.vehicleId);
    const result = await db.maintenanceTask.updateMany({ where: { id: data.id, vehicleId: data.vehicleId, isActive: true }, data: { isActive: false } });
    if (result.count !== 1) throw new ActionError("La regla indicada no existe o ya está inactiva.");
    refresh(vehicle.slug);
    return { success: "Regla desactivada." };
  } catch (error) {
    return { error: actionError(error) };
  }
}
