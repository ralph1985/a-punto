import { scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyAccessCode } from "./access-code";

const scrypt = promisify(scryptCallback);

afterEach(() => vi.unstubAllEnvs());

describe("código de acceso", () => {
  it("acepta el formato sin signos de dólar para proveedores de variables que los expanden", async () => {
    const salt = "sal-de-prueba";
    const hash = (await scrypt("codigo-correcto", salt, 64) as Buffer).toString("base64url");
    vi.stubEnv("APP_ACCESS_CODE_HASH", `scrypt:${salt}:${hash}`);

    await expect(verifyAccessCode("codigo-correcto")).resolves.toBe(true);
    await expect(verifyAccessCode("codigo-incorrecto")).resolves.toBe(false);
  });
});
