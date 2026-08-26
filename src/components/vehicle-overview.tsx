import Link from "next/link";
import { CarProfile, Gauge, Wrench } from "@phosphor-icons/react/dist/ssr";
import { updateOdometer } from "@/app/actions";

type VehicleOverviewProps = { vehicle: { id: string; name: string; brand: string; model: string; year: number | null; licensePlate: string | null; odometer: number | null; tasks: Array<{ id: string; title: string; evaluation: { status: string; reasons: string[] } }> } };
const labels: Record<string, string> = { overdue: "Vencido", soon: "Próximo", upcoming: "Al día", "needs-odometer": "Falta km", unscheduled: "Sin regla" };

export function VehicleOverview({ vehicle }: VehicleOverviewProps) {
  const relevant = vehicle.tasks.filter((task) => task.evaluation.status === "overdue" || task.evaluation.status === "soon").slice(0, 2);
  return <article className="vehicle-card"><div className="vehicle-card-head"><span className="vehicle-icon"><CarProfile size={23} weight="regular" aria-hidden="true" /></span><div><h2>{vehicle.name}</h2><p>{vehicle.brand} {vehicle.model}{vehicle.year ? ` · ${vehicle.year}` : ""}</p></div><Link href={`/coches/${vehicle.id}`}>Abrir</Link></div><div className="vehicle-odometer"><Gauge size={20} aria-hidden="true" /><div><span>Odómetro</span><strong>{vehicle.odometer === null ? "Sin lectura" : `${vehicle.odometer.toLocaleString("es-ES")} km`}</strong></div></div><form action={updateOdometer} className="odometer-form"><input type="hidden" name="vehicleId" value={vehicle.id} /><label htmlFor={`km-${vehicle.id}`}>Actualizar km</label><input id={`km-${vehicle.id}`} name="valueKm" type="number" min="0" placeholder={vehicle.odometer?.toString() ?? "Kilómetros actuales"} required /><button type="submit">Guardar</button></form><div className="vehicle-alerts"><div className="alerts-heading"><Wrench size={18} aria-hidden="true" /><span>Próximo mantenimiento</span></div>{relevant.length ? relevant.map((task) => <div className="task-row" key={task.id}><span className={`task-status ${task.evaluation.status}`}>{labels[task.evaluation.status]}</span><div><strong>{task.title}</strong><small>{task.evaluation.reasons.join(" · ")}</small></div></div>) : <p>No hay avisos próximos.</p>}</div></article>;
}
