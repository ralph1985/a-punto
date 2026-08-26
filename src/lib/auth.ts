import { createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE } from "./auth-constants";

export { SESSION_COOKIE };
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("Falta SESSION_SECRET.");
  }

  return secret;
}

export function signSession(expiresAt: number) {
  const payload = `a-punto:${expiresAt}`;
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}:${signature}`;
}

export function createSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  return { value: signSession(expiresAt), expiresAt };
}

export function isValidSession(value?: string) {
  if (!value) return false;
  const [prefix, expiresAtRaw, signature] = value.split(":");
  const expiresAt = Number(expiresAtRaw);

  if (prefix !== "a-punto" || !signature || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() / 1000) {
    return false;
  }

  const expected = signSession(expiresAt).split(":").at(-1);
  if (!expected || expected.length !== signature.length) return false;

  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
