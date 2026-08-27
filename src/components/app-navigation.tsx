import Link from "next/link";
import { CarProfile, Gauge, Van } from "@phosphor-icons/react/dist/ssr";
import { BrandCar } from "@/components/brand-car";
import type { VehicleRouteSlug } from "@/lib/vehicle-routes";

const items = [{ href: "/", label: "Hoy", id: "today", icon: Gauge }, { href: "/punto", label: "Punto", id: "punto", icon: CarProfile }, { href: "/rifter", label: "Rifter", id: "rifter", icon: Van }] as const;

export function AppNavigation({ current }: { current: "today" | VehicleRouteSlug }) {
  return <nav className="app-navigation" aria-label="Secciones principales"><Link className="wordmark" href="/" aria-label="A Punto, inicio"><span className="wordmark-icon"><BrandCar size={25} /></span><span>A Punto</span></Link><div className="navigation-items">{items.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={current === item.id ? "navigation-item active" : "navigation-item"}><Icon size={20} weight={current === item.id ? "fill" : "regular"} aria-hidden="true" /><span>{item.label}</span></Link>; })}</div></nav>;
}
