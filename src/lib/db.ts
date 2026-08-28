import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { normalizePostgresConnectionString } from "./db-connection";

const globalForDatabase = globalThis as unknown as { prisma?: PrismaClient; pool?: Pool };

function createDatabase() {
  const rawConnectionString = process.env.DATABASE_URL;
  if (!rawConnectionString) throw new Error("Falta DATABASE_URL.");
  const connectionString = normalizePostgresConnectionString(rawConnectionString);
  const pool = globalForDatabase.pool ?? new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  if (process.env.NODE_ENV !== "production") { globalForDatabase.pool = pool; globalForDatabase.prisma = prisma; }
  return prisma;
}

export const db = globalForDatabase.prisma ?? createDatabase();
