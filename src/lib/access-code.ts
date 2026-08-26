import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function verifyAccessCode(code: string) {
  const stored = process.env.APP_ACCESS_CODE_HASH;
  if (!stored) return false;

  const separator = stored.startsWith("scrypt:") ? ":" : "$";
  const [algorithm, salt, expected] = stored.split(separator);
  if (algorithm !== "scrypt" || !salt || !expected) return false;

  const derived = (await scrypt(code, salt, 64)) as Buffer;
  const expectedBuffer = Buffer.from(expected, "base64url");

  return derived.length === expectedBuffer.length && timingSafeEqual(derived, expectedBuffer);
}
