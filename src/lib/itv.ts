import type { ItvResult } from "@/generated/prisma/client";

export const itvResultLabels: Record<ItvResult, string> = {
  FAVORABLE: "Favorable",
  DESFAVORABLE: "Desfavorable",
  NEGATIVA: "Negativa",
};

export const itvResultClasses: Record<ItvResult, string> = {
  FAVORABLE: "favorable",
  DESFAVORABLE: "desfavorable",
  NEGATIVA: "negativa",
};
