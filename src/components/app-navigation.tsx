"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CarProfile, Gauge, Van } from "@phosphor-icons/react";
import { BrandCar } from "@/components/brand-car";
import { NavigationLink } from "@/components/navigation-link";
import {
  parseVehicleNavigationMetadata,
  readVehicleNavigationCache,
  writeVehicleNavigationCache,
  type VehicleNavigationMetadata,
} from "@/lib/vehicle-navigation";
import type { VehicleRouteSlug } from "@/lib/vehicle-routes";

const vehicleIcons: Record<VehicleNavigationMetadata["menuIcon"], typeof CarProfile> = { CAR: CarProfile, VAN: Van };

export function AppNavigation({ current }: { current: "today" | VehicleRouteSlug }) {
  const [vehicles, setVehicles] = useState<VehicleNavigationMetadata[]>([]);

  useEffect(() => {
    let cancelled = false;
    let storage: Storage | undefined;

    try {
      storage = window.sessionStorage;
    } catch {
      // Private browsing and blocked storage are supported through the network fallback.
    }

    const cachedVehicles = readVehicleNavigationCache(storage);
    if (cachedVehicles) {
      void Promise.resolve(cachedVehicles).then((vehiclesFromCache) => {
        if (!cancelled) setVehicles(vehiclesFromCache);
      });
      return () => {
        cancelled = true;
      };
    }

    async function loadVehicles() {
      try {
        const response = await fetch("/api/vehicles/navigation", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;

        const fetchedVehicles = parseVehicleNavigationMetadata(await response.json());
        if (!fetchedVehicles || cancelled) return;

        writeVehicleNavigationCache(storage, fetchedVehicles);
        setVehicles(fetchedVehicles);
      } catch {
        // The page remains usable even when the menu metadata cannot be loaded.
      }
    }

    void loadVehicles();
    return () => {
      cancelled = true;
    };
  }, []);

  return <nav className="app-navigation" aria-label="Secciones principales"><Link className="wordmark" href="/" aria-label="A Punto, inicio"><span className="wordmark-icon"><BrandCar size={25} /></span><span>A Punto</span></Link><div className="navigation-items"><NavigationLink href="/" className={current === "today" ? "navigation-item active" : "navigation-item"}><Gauge size={20} weight={current === "today" ? "fill" : "regular"} aria-hidden="true" /><span className="navigation-label">Hoy</span></NavigationLink>{vehicles.map((vehicle) => { const Icon = vehicleIcons[vehicle.menuIcon]; const active = current === vehicle.slug; return <NavigationLink key={vehicle.slug} href={`/${vehicle.slug}`} className={active ? "navigation-item active" : "navigation-item"}><Icon size={20} weight={active ? "fill" : "regular"} aria-hidden="true" /><span className="navigation-label">{vehicle.name}</span></NavigationLink>; })}</div></nav>;
}
