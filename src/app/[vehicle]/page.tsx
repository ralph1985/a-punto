import { notFound } from "next/navigation";
import { AppNavigation } from "@/components/app-navigation";
import { VehicleDetailPage } from "@/components/vehicle-detail-page";
import { getVehicleBySlug, isVehicleRouteSlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";

export default async function VehiclePage({ params }: { params: Promise<{ vehicle: string }> }) {
  await requireSession();
  const { vehicle: route } = await params;
  if (!isVehicleRouteSlug(route)) notFound();
  const vehicle = await getVehicleBySlug(route);
  if (!vehicle) notFound();
  return <div className="app-shell"><AppNavigation current={route} /><VehicleDetailPage vehicle={vehicle} /></div>;
}
