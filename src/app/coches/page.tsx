import { CarProfile } from "@phosphor-icons/react/dist/ssr";
import { AppNavigation } from "@/components/app-navigation";
import { VehicleOverview } from "@/components/vehicle-overview";
import { getDashboard } from "@/lib/dashboard";
import { requireSession } from "@/lib/require-session";

export default async function VehiclesPage() {
  await requireSession();
  const vehicles = await getDashboard();
  return <div className="app-shell"><AppNavigation current="/coches" /><main className="app-main"><header className="page-header"><div><p className="eyebrow">Ficha de vehículo</p><h1>Coches</h1><p>Plan preventivo, historial y documentos de cada coche.</p></div><CarProfile size={38} weight="regular" aria-hidden="true" /></header><section className="vehicles-grid" aria-label="Coches"><>{vehicles.map((vehicle) => <VehicleOverview key={vehicle.id} vehicle={vehicle} />)}</></section></main></div>;
}
