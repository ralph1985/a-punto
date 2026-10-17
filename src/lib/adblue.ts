export type AdBlueRefillMeta = {
  litres: number;
  unitPrice: number;
  odometerKm: number;
  remainingRangeKm: number | null;
};

export function calculateAdBlueCost(litres: number, unitPrice: number) {
  return Math.round(litres * unitPrice * 100) / 100;
}

export function formatAdBlueRefillMeta(refill: AdBlueRefillMeta) {
  const range = refill.remainingRangeKm === null ? null : `quedaban ${refill.remainingRangeKm.toLocaleString("es-ES")} km`;
  return [
    `${refill.litres.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`,
    `${refill.unitPrice.toLocaleString("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} €/L`,
    `${refill.odometerKm.toLocaleString("es-ES")} km`,
    range,
  ].filter(Boolean).join(" · ");
}
