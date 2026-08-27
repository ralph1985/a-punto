import { createHmac } from "node:crypto";
import { db } from "@/lib/db";
import { isBlocked, nextSnapshot } from "@/lib/login-rate-limit-policy";

function rateLimitSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Falta SESSION_SECRET.");
  return secret;
}

export function getLoginClientIp(headers: Headers) {
  const forwarded = headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for");
  const value = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "unknown";
  return value.slice(0, 128) || "unknown";
}

function getKeyHash(clientIp: string) {
  return createHmac("sha256", rateLimitSecret()).update(`a-punto:login:${clientIp}`).digest("hex");
}

export async function isLoginBlocked(clientIp: string) {
  const snapshot = await db.loginRateLimit.findUnique({
    where: { keyHash: getKeyHash(clientIp) },
    select: { failedAttempts: true, windowStartedAt: true, blockedUntil: true },
  });
  return isBlocked(snapshot);
}

export async function recordFailedLogin(clientIp: string) {
  const keyHash = getKeyHash(clientIp);
  const now = new Date();

  return db.$transaction(async (transaction) => {
    const current = await transaction.loginRateLimit.upsert({
      where: { keyHash },
      create: { keyHash, failedAttempts: 0, windowStartedAt: now },
      update: {},
      select: { failedAttempts: true, windowStartedAt: true, blockedUntil: true },
    });

    if (isBlocked(current, now)) return true;

    const next = nextSnapshot(current, now);
    await transaction.loginRateLimit.update({
      where: { keyHash },
      data: next,
    });
    return isBlocked(next, now);
  });
}

export async function clearLoginAttempts(clientIp: string) {
  await db.loginRateLimit.deleteMany({ where: { keyHash: getKeyHash(clientIp) } });
}
