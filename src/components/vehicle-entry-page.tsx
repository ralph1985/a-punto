import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { AppNavigation } from "@/components/app-navigation";
import type { VehicleDetail } from "@/lib/vehicle-routes";

type VehicleEntryContext = Pick<VehicleDetail, "slug" | "name">;

export function VehicleEntryPage({ vehicle, title, description, children }: { vehicle: VehicleEntryContext; title: string; description: string; children: ReactNode }) {
  return <div className="app-shell">
    <AppNavigation current={vehicle.slug} />
    <main className="app-main entry-page">
      <Link className="back-link" href={`/${vehicle.slug}`}><ArrowLeft size={18} aria-hidden="true" /> Volver a {vehicle.name}</Link>
      <header className="entry-page-header">
        <p className="eyebrow">{vehicle.name}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  </div>;
}
