import { describe, expect, it } from "vitest";
import { normalizePostgresConnectionString } from "./db-connection";

describe("conexión PostgreSQL", () => {
  it("fija verify-full para el alias require", () => {
    const normalized = normalizePostgresConnectionString("postgres://user:pass@example.test/db?sslmode=require");

    expect(new URL(normalized ?? "").searchParams.get("sslmode")).toBe("verify-full");
  });

  it("conserva modos explícitos no heredados", () => {
    expect(normalizePostgresConnectionString("postgres://user:pass@example.test/db?sslmode=disable")).toBe("postgres://user:pass@example.test/db?sslmode=disable");
    expect(normalizePostgresConnectionString("postgres://user:pass@example.test/db?sslmode=verify-full")).toBe("postgres://user:pass@example.test/db?sslmode=verify-full");
  });

  it("no modifica una variable ausente", () => {
    expect(normalizePostgresConnectionString(undefined)).toBeUndefined();
  });
});
