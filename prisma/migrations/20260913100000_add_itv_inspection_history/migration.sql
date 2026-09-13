-- Store structured ITV reports separately from the vehicle's next-due summary.
CREATE TYPE "ItvResult" AS ENUM ('FAVORABLE', 'DESFAVORABLE', 'NEGATIVA');

CREATE TABLE "ItvInspection" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "nextInspectionDate" TIMESTAMP(3) NOT NULL,
    "result" "ItvResult" NOT NULL,
    "inspectionType" TEXT,
    "odometerKm" INTEGER,
    "stationCode" TEXT,
    "stationName" TEXT,
    "stationAddress" TEXT,
    "reportNumber" TEXT,
    "invoiceNumber" TEXT,
    "fee" DECIMAL(10,2),
    "defects" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItvInspection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ItvInspection_vehicleId_inspectionDate_idx" ON "ItvInspection"("vehicleId", "inspectionDate");

ALTER TABLE "ItvInspection"
  ADD CONSTRAINT "ItvInspection_vehicleId_fkey"
  FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Initial report supplied by the owner for the Fiat Punto.
INSERT INTO "ItvInspection" (
    "id", "vehicleId", "inspectionDate", "nextInspectionDate", "result",
    "inspectionType", "odometerKm", "stationCode", "stationName", "stationAddress",
    "reportNumber", "invoiceNumber", "fee", "createdAt", "updatedAt"
)
SELECT
    'itv-punto-20260911',
    "id",
    TIMESTAMP '2026-09-11 00:00:00',
    TIMESTAMP '2027-09-11 00:00:00',
    'FAVORABLE'::"ItvResult",
    '001 PERIODICA',
    256287,
    '2857',
    'General de Servicios ITV, S.A.',
    'Avenida de Daganzo, 19, 28806 Alcalá de Henares, Madrid',
    '365.088',
    '2857/2026/214730',
    39.00,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Vehicle"
WHERE "slug" = 'punto'
  AND NOT EXISTS (SELECT 1 FROM "ItvInspection" WHERE "id" = 'itv-punto-20260911');

INSERT INTO "OdometerReading" ("id", "vehicleId", "valueKm", "recordedAt", "note")
SELECT
    'odometer-itv-punto-20260911',
    "id",
    256287,
    TIMESTAMP '2026-09-11 00:00:00',
    'Registrado con ITV itv-punto-20260911'
FROM "Vehicle"
WHERE "slug" = 'punto'
  AND NOT EXISTS (SELECT 1 FROM "OdometerReading" WHERE "id" = 'odometer-itv-punto-20260911');

UPDATE "Vehicle"
SET "itvExpiresAt" = TIMESTAMP '2027-09-11 00:00:00',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'punto';
