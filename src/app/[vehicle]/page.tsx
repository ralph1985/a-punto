import { notFound } from "next/navigation";
import { AppNavigation } from "@/components/app-navigation";
import { VehicleDetailPage } from "@/components/vehicle-detail-page";
import { getVehicleBySlug } from "@/lib/vehicle-routes";
import { requireSession } from "@/lib/require-session";
import { parseHistoryFilters } from "@/lib/vehicle-history";
import { parseVehicleTab } from "@/lib/vehicle-tabs";

export default async function VehiclePage({ params, searchParams }: { params: Promise<{ vehicle: string }>; searchParams: Promise<{ tab?: string | string[]; year?: string | string[]; category?: string | string[]; q?: string | string[] }> }) {
  await requireSession();
  const { vehicle: route } = await params;
  const search = await searchParams;
  const vehicle = await getVehicleBySlug(route);
  if (!vehicle) notFound();
  return <div className="app-shell"><AppNavigation current={vehicle.slug} /><VehicleDetailPage activeTab={parseVehicleTab(search.tab)} historyFilters={parseHistoryFilters(search)} vehicle={vehicle} /></div>;
}
