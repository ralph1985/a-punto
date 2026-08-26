import { notFound, redirect } from "next/navigation";
import { getVehicleById, getVehicleSlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function LegacyVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  const slug = vehicle ? getVehicleSlug(vehicle) : null;
  if (!slug) notFound();
  redirect(`/${slug}`);
}
