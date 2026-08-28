#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
backup_dir="$project_dir/var/backups/postgres"
log_dir="$project_dir/var/log"
timestamp="$(TZ=Europe/Madrid date +%Y%m%dT%H%M%S)"

if [[ -f "$project_dir/.env.local" ]]; then
  DATABASE_URL="${DATABASE_URL:-$(node -e 'require("dotenv").config({ path: process.argv[1], quiet: true }); process.stdout.write(process.env.DATABASE_URL || "")' "$project_dir/.env.local")}"
fi

DATABASE_URL="$(DATABASE_URL="$DATABASE_URL" node -e 'const value = process.env.DATABASE_URL; if (!value) process.exit(1); const url = new URL(value); const mode = url.searchParams.get("sslmode"); if (!mode || ["prefer", "require", "verify-ca"].includes(mode)) url.searchParams.set("sslmode", "verify-full"); process.stdout.write(url.toString())')"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Falta DATABASE_URL" >&2
  exit 1
fi

mkdir -p "$backup_dir" "$log_dir"
chmod 700 "$backup_dir" "$log_dir"
umask 077
pg_dump --format=custom --file "$backup_dir/a-punto-$timestamp.dump" "$DATABASE_URL"
find "$backup_dir" -type f -name 'a-punto-*.dump' -mtime +30 -delete
printf '%s backup=%s\n' "$(TZ=Europe/Madrid date --iso-8601=seconds)" "$backup_dir/a-punto-$timestamp.dump" >> "$log_dir/postgres-backup.log"
