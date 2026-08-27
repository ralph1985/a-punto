-- Data from the owner's vehicle purchase record.
UPDATE "Vehicle"
SET
  "purchasedAt" = TIMESTAMP '2025-12-19 00:00:00',
  "itvExpiresAt" = TIMESTAMP '2029-12-18 00:00:00'
WHERE lower("model") LIKE '%rifter%';
