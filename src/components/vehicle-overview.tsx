import Link from "next/link";
import { CarProfile, Van, Wrench } from "@phosphor-icons/react/dist/ssr";
import type { VehicleRouteSlug } from "@/lib/vehicle-routes";

type VehicleOverviewProps = { vehicle: { name: string; brand: string; model: string; year: number | null; slug: VehicleRouteSlug | null; tasks: Array<{ id: string; title: string; evaluation: { status: string; reasons: string[] } }> } };
const labels: Record<string, string> = { overdue: "Vencido", soon: "Próximo", upcoming: "Al día", "needs-odometer": "Falta km", unscheduled: "Sin regla" };

export function VehicleOverview({ vehicle }: VehicleOverviewProps) {
  const relevant = vehicle.tasks.filter((task) => task.evaluation.status === "overdue" || task.evaluation.status === "soon" || task.evaluation.status === "needs-odometer").slice(0, 2);
  const href = vehicle.slug ? `/${vehicle.slug}` : "/";
  const VehicleIcon = vehicle.slug === "rifter" ? Van : CarProfile;
  return <article className="vehicle-card"><div className="vehicle-card-head"><span className="vehicle-icon"><VehicleIcon size={23} weight="regular" aria-hidden="true" /></span><div><h2>{vehicle.name}</h2><p>{vehicle.brand} {vehicle.model}{vehicle.year ? ` · ${vehicle.year}` : ""}</p></div><Link href={href}>Ver avisos</Link></div><div className="vehicle-alerts"><div className="alerts-heading"><Wrench size={18} aria-hidden="true" /><span>Mantenimiento</span></div>{relevant.length ? relevant.map((task) => <div className="task-row" key={task.id}><span className={`task-status ${task.evaluation.status}`}>{labels[task.evaluation.status]}</span><div><strong>{task.title}</strong><small>{task.evaluation.reasons.join(" · ")}</small></div></div>) : <p>Al día. No hay avisos próximos.</p>}</div></article>;
}
