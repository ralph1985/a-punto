import Link from "next/link";
import { CarProfile, Gauge, Van } from "@phosphor-icons/react/dist/ssr";
import { BrandCar } from "@/components/brand-car";
import { NavigationLink } from "@/components/navigation-link";
import type { VehicleMenuIcon } from "@/generated/prisma/client";
import type { VehicleRouteSlug } from "@/lib/vehicle-routes";

const vehicleIcons: Record<VehicleMenuIcon, typeof CarProfile> = { CAR: CarProfile, VAN: Van };

export function AppNavigation({ current, vehicles }: { current: "today" | VehicleRouteSlug; vehicles: Array<{ slug: string; name: string; menuIcon: VehicleMenuIcon }> }) {
  return <nav className="app-navigation" aria-label="Secciones principales"><Link className="wordmark" href="/" aria-label="A Punto, inicio"><span className="wordmark-icon"><BrandCar size={25} /></span><span>A Punto</span></Link><div className="navigation-items"><NavigationLink href="/" className={current === "today" ? "navigation-item active" : "navigation-item"}><Gauge size={20} weight={current === "today" ? "fill" : "regular"} aria-hidden="true" /><span className="navigation-label">Hoy</span></NavigationLink>{vehicles.map((vehicle) => { const Icon = vehicleIcons[vehicle.menuIcon]; const active = current === vehicle.slug; return <NavigationLink key={vehicle.slug} href={`/${vehicle.slug}`} className={active ? "navigation-item active" : "navigation-item"}><Icon size={20} weight={active ? "fill" : "regular"} aria-hidden="true" /><span className="navigation-label">{vehicle.name}</span></NavigationLink>; })}</div></nav>;
}
