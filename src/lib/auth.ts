import { createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE } from "./auth-constants";

export { SESSION_COOKIE };
const SESSION_MAX_AGE_MS = 60 * 60 * 12 * 1000;

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("Falta SESSION_SECRET.");
  }

  return secret;
}

export function signSession(issuedAt: number, expiresAt: number) {
  const payload = `a-punto:${issuedAt}:${expiresAt}`;
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}:${signature}`;
}

export function createSession() {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_MAX_AGE_MS;
  return { value: signSession(issuedAt, expiresAt), expiresAt };
}

export function isValidSession(value?: string) {
  if (!value) return false;
  const [prefix, issuedAtRaw, expiresAtRaw, signature] = value.split(":");
  const issuedAt = Number(issuedAtRaw);
  const expiresAt = Number(expiresAtRaw);

  if (prefix !== "a-punto" || !signature || !Number.isSafeInteger(issuedAt) || !Number.isSafeInteger(expiresAt) || issuedAt > Date.now() || expiresAt <= Date.now() || expiresAt <= issuedAt) {
    return false;
  }

  const expected = signSession(issuedAt, expiresAt).split(":").at(-1);
  if (!expected || expected.length !== signature.length) return false;

  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function sessionIssuedAt(value: string) {
  const issuedAt = Number(value.split(":")[1]);
  return Number.isSafeInteger(issuedAt) ? issuedAt : null;
}

export async function isSessionRevoked(value: string) {
  const issuedAt = sessionIssuedAt(value);
  if (issuedAt === null) return true;

  const { db } = await import("./db");
  const control = await db.sessionControl.findUnique({ where: { id: 1 }, select: { revokedBefore: true } });
  return control?.revokedBefore ? issuedAt <= control.revokedBefore.getTime() : false;
}

export async function revokeAllSessions() {
  const { db } = await import("./db");
  await db.sessionControl.upsert({
    where: { id: 1 },
    create: { id: 1, revokedBefore: new Date() },
    update: { revokedBefore: new Date() },
  });
}
