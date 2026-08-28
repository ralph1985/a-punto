-- Store the public route and menu icon for each vehicle.
CREATE TYPE "VehicleMenuIcon" AS ENUM ('CAR', 'VAN');

ALTER TABLE "Vehicle"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "menuIcon" "VehicleMenuIcon" NOT NULL DEFAULT 'CAR';

UPDATE "Vehicle"
SET
  "slug" = CASE
    WHEN lower(concat("name", ' ', "model")) LIKE '%punto%' THEN 'punto'
    WHEN lower(concat("name", ' ', "model")) LIKE '%rifter%' THEN 'rifter'
    ELSE coalesce(nullif(trim(both '-' from lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'))), ''), 'vehicle-' || "id")
  END,
  "menuIcon" = CASE
    WHEN lower(concat("name", ' ', "model")) LIKE '%rifter%' THEN 'VAN'::"VehicleMenuIcon"
    ELSE 'CAR'::"VehicleMenuIcon"
  END;

ALTER TABLE "Vehicle" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Vehicle_slug_key" ON "Vehicle"("slug");
