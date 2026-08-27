export const LOGIN_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  blockMs: 15 * 60 * 1000,
} as const;

export type LoginRateLimitSnapshot = {
  failedAttempts: number;
  windowStartedAt: Date;
  blockedUntil: Date | null;
};

export function isBlocked(snapshot: LoginRateLimitSnapshot | null, now = new Date()) {
  return snapshot?.blockedUntil !== null && snapshot?.blockedUntil !== undefined && snapshot.blockedUntil > now;
}

export function nextSnapshot(snapshot: LoginRateLimitSnapshot, now = new Date()): LoginRateLimitSnapshot {
  if (now.getTime() - snapshot.windowStartedAt.getTime() >= LOGIN_RATE_LIMIT.windowMs) {
    return { failedAttempts: 1, windowStartedAt: now, blockedUntil: null };
  }

  const failedAttempts = snapshot.failedAttempts + 1;
  return {
    failedAttempts,
    windowStartedAt: snapshot.windowStartedAt,
    blockedUntil: failedAttempts >= LOGIN_RATE_LIMIT.maxAttempts
      ? new Date(now.getTime() + LOGIN_RATE_LIMIT.blockMs)
      : null,
  };
}
