-- Allows logout to revoke all stateless sessions for this single-user application.
CREATE TABLE "SessionControl" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "revokedBefore" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionControl_pkey" PRIMARY KEY ("id")
);
