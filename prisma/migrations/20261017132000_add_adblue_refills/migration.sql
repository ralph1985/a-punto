-- CreateTable
CREATE TABLE "AdBlueRefill" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "refillDate" TIMESTAMP(3) NOT NULL,
    "odometerKm" INTEGER NOT NULL,
    "litres" DECIMAL(8,2) NOT NULL,
    "unitPrice" DECIMAL(8,3) NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "remainingRangeKm" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdBlueRefill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdBlueRefill_vehicleId_refillDate_idx" ON "AdBlueRefill"("vehicleId", "refillDate");

-- AddForeignKey
ALTER TABLE "AdBlueRefill" ADD CONSTRAINT "AdBlueRefill_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
