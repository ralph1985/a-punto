#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
backup_dir="$project_dir/var/backups/postgres"
log_dir="$project_dir/var/log"
timestamp="$(TZ=Europe/Madrid date +%Y%m%dT%H%M%S)"
node_bin="${NODE_BIN:-$(command -v node || true)}"

if [[ -z "$node_bin" ]]; then
  echo "No se encuentra Node.js para cargar la configuración de la base de datos." >&2
  exit 1
fi

DATABASE_URL="${DATABASE_URL:-}"
if [[ -z "$DATABASE_URL" && -f "$project_dir/.env.local" ]]; then
  DATABASE_URL="$("$node_bin" -e 'require(process.argv[1]).config({ path: process.argv[2], quiet: true }); process.stdout.write(process.env.DATABASE_URL || "")' "$project_dir/node_modules/dotenv" "$project_dir/.env.local")"
fi

if [[ -z "$DATABASE_URL" ]]; then
  echo "Falta DATABASE_URL" >&2
  exit 1
fi

DATABASE_URL="$(DATABASE_URL="$DATABASE_URL" "$node_bin" -e 'const value = process.env.DATABASE_URL; if (!value) process.exit(1); const url = new URL(value); const mode = url.searchParams.get("sslmode"); if (!mode || ["prefer", "require", "verify-ca"].includes(mode)) url.searchParams.set("sslmode", "verify-full"); if (url.searchParams.get("sslmode") === "verify-full" && !url.searchParams.has("sslrootcert")) url.searchParams.set("sslrootcert", "system"); process.stdout.write(url.toString())')"

mkdir -p "$backup_dir" "$log_dir"
chmod 700 "$backup_dir" "$log_dir"
umask 077
backup_file="$backup_dir/a-punto-$timestamp.dump"
temporary_file="$backup_file.tmp.$$"
trap 'rm -f "$temporary_file"' EXIT
pg_dump --format=custom --file "$temporary_file" "$DATABASE_URL"
mv "$temporary_file" "$backup_file"
trap - EXIT
find "$backup_dir" -type f -name 'a-punto-*.dump' -mtime +30 -delete
log_line="OK: backup SQL creado en $backup_file $(TZ=Europe/Madrid date +%Y%m%d-%H%M%S)"
printf '%s\n' "$log_line" | tee -a "$log_dir/postgres-backup.log"
