-- AlterTable
ALTER TABLE "Vehicle"
  ADD COLUMN "purchasedAt" TIMESTAMP(3),
  ADD COLUMN "itvExpiresAt" TIMESTAMP(3);

-- Data from the owner, kept with the schema migration for an auditable import.
UPDATE "Vehicle"
SET
  "purchasedAt" = TIMESTAMP '2008-09-12 00:00:00',
  "itvExpiresAt" = TIMESTAMP '2026-09-11 00:00:00'
WHERE lower("model") LIKE '%punto%';
