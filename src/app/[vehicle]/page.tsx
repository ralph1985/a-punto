import { notFound } from "next/navigation";
import { AppNavigation } from "@/components/app-navigation";
import { VehicleDetailPage } from "@/components/vehicle-detail-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function VehiclePage({ params }: { params: Promise<{ vehicle: string }> }) {
  await requireSession();
  const { vehicle: route } = await params;
  const vehicle = await getVehicleBySlug(route);
  if (!vehicle) notFound();
  return <div className="app-shell"><AppNavigation current={vehicle.slug} /><VehicleDetailPage vehicle={vehicle} /></div>;
}
