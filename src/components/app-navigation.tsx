import Link from "next/link";
import { CarProfile, CurrencyEur, Gauge } from "@phosphor-icons/react/dist/ssr";
import { BrandCar } from "@/components/brand-car";

const items = [{ href: "/", label: "Hoy", icon: Gauge }, { href: "/coches", label: "Coches", icon: CarProfile }, { href: "/costes", label: "Costes", icon: CurrencyEur }] as const;

export function AppNavigation({ current }: { current: "/" | "/coches" | "/costes" }) {
  return <nav className="app-navigation" aria-label="Secciones principales"><Link className="wordmark" href="/" aria-label="A Punto, inicio"><span className="wordmark-icon"><BrandCar size={25} /></span><span>A Punto</span></Link><div className="navigation-items">{items.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={current === item.href ? "navigation-item active" : "navigation-item"}><Icon size={20} weight={current === item.href ? "fill" : "regular"} aria-hidden="true" /><span>{item.label}</span></Link>; })}</div></nav>;
}
