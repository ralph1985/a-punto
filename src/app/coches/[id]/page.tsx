import { notFound, redirect } from "next/navigation";
import { getVehicleById } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function LegacyVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) notFound();
  redirect(`/${vehicle.slug}`);
}
