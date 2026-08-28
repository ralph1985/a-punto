const legacySslModes = new Set(["prefer", "require", "verify-ca"]);

export function normalizePostgresConnectionString(connectionString: string | undefined) {
  if (!connectionString) return connectionString;

  const url = new URL(connectionString);
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") return connectionString;

  const sslMode = url.searchParams.get("sslmode");
  if (!sslMode || legacySslModes.has(sslMode)) url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}
