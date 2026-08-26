import { CurrencyEur } from "@phosphor-icons/react/dist/ssr";
import { AppNavigation } from "@/components/app-navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/require-session";

export default async function CostsPage() {
  await requireSession();
  const events = await db.maintenanceEvent.findMany({ where: { cost: { not: null } }, include: { vehicle: true }, orderBy: { serviceDate: "desc" } });
  const total = events.reduce((sum, event) => sum + Number(event.cost), 0);
  const byVehicle = new Map<string, number>();
  for (const event of events) byVehicle.set(event.vehicle.name, (byVehicle.get(event.vehicle.name) ?? 0) + Number(event.cost));
  return <div className="app-shell"><AppNavigation current="/costes" /><main className="app-main"><header className="page-header"><div><p className="eyebrow">Gasto de mantenimiento</p><h1>Costes</h1><p>Histórico importado de intervenciones con coste registrado.</p></div><CurrencyEur size={38} weight="regular" aria-hidden="true" /></header><section className="cost-summary"><article><span>Total histórico</span><strong>{total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</strong><small>{events.length} intervenciones con importe.</small></article>{[...byVehicle].map(([name, amount]) => <article key={name}><span>{name}</span><strong>{amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</strong><small>Coste acumulado.</small></article>)}</section></main></div>;
}
