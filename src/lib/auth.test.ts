import { afterEach, describe, expect, it, vi } from "vitest";
import { createSession, isValidSession } from "./auth";

afterEach(() => vi.unstubAllEnvs());

describe("sesión privada", () => {
  it("acepta una sesión recién firmada", () => {
    vi.stubEnv("SESSION_SECRET", "secreto-de-prueba");
    expect(isValidSession(createSession().value)).toBe(true);
  });

  it("rechaza una firma alterada", () => {
    vi.stubEnv("SESSION_SECRET", "secreto-de-prueba");
    const session = createSession().value;
    expect(isValidSession(`${session}x`)).toBe(false);
  });
});
