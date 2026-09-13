-- Preserve the printed observations from the owner's ITV report.
UPDATE "ItvInspection"
SET "observations" = 'Elementos inspeccionados en OFICINA como O. Elementos inspeccionados por 074 como A.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'itv-punto-20260911'
  AND "observations" IS NULL;
