import { describe, expect, it } from "vitest";
import { isBlocked, LOGIN_RATE_LIMIT, nextSnapshot } from "./login-rate-limit-policy";

const windowStart = new Date("2026-08-27T10:00:00.000Z");

describe("límite de intentos de acceso", () => {
  it("bloquea después del quinto fallo dentro de la ventana", () => {
    const snapshot = { failedAttempts: 4, windowStartedAt: windowStart, blockedUntil: null };
    const next = nextSnapshot(snapshot, new Date("2026-08-27T10:01:00.000Z"));

    expect(next.failedAttempts).toBe(LOGIN_RATE_LIMIT.maxAttempts);
    expect(isBlocked(next, new Date("2026-08-27T10:02:00.000Z"))).toBe(true);
  });

  it("reinicia el contador cuando termina la ventana", () => {
    const snapshot = { failedAttempts: 4, windowStartedAt: windowStart, blockedUntil: null };
    const next = nextSnapshot(snapshot, new Date(windowStart.getTime() + LOGIN_RATE_LIMIT.windowMs));

    expect(next.failedAttempts).toBe(1);
    expect(next.blockedUntil).toBeNull();
  });

  it("deja pasar cuando el bloqueo ya ha expirado", () => {
    const snapshot = { failedAttempts: 5, windowStartedAt: windowStart, blockedUntil: new Date("2026-08-27T10:15:00.000Z") };

    expect(isBlocked(snapshot, new Date("2026-08-27T10:15:00.000Z"))).toBe(false);
  });
});
