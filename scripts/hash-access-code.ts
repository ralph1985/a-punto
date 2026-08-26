import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const code = process.argv[2];

if (!code) {
  console.error("Uso: pnpm auth:hash -- <codigo-secreto>");
  process.exit(1);
}

async function main() {
  const salt = randomBytes(16).toString("base64url");
  const hash = (await scrypt(code, salt, 64)) as Buffer;
  console.log(`scrypt:${salt}:${hash.toString("base64url")}`);
}

void main();
