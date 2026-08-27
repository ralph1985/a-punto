import { CalendarCheck, Wrench } from "@phosphor-icons/react/dist/ssr";
import { AppNavigation } from "@/components/app-navigation";
import { VehicleOverview } from "@/components/vehicle-overview";
import { getDashboard } from "@/lib/dashboard";
import { requireSession } from "@/lib/require-session";

export default async function Home() {
  await requireSession();
  const vehicles = await getDashboard();
  const dueCount = vehicles.flatMap((vehicle) => vehicle.tasks).filter((task) => task.evaluation.status === "overdue" || task.evaluation.status === "soon" || task.evaluation.status === "needs-odometer").length;
  return <div className="app-shell"><AppNavigation current="today" /><main className="app-main"><header className="page-header"><div><p className="eyebrow">Agenda de mantenimiento</p><h1>Hoy</h1><p>{dueCount ? `${dueCount} avisos requieren atención.` : "Los coches están al día."}</p></div></header><section className="dashboard-strip"><CalendarCheck size={23} aria-hidden="true" /><div><strong>Estado de tus coches</strong><span>Consulta los avisos antes de que venzan por fecha o kilómetros.</span></div><Wrench size={23} aria-hidden="true" /></section><section className="vehicles-grid" aria-label="Avisos de los coches">{vehicles.map((vehicle) => <VehicleOverview key={vehicle.id} vehicle={vehicle} />)}</section></main></div>;
}
