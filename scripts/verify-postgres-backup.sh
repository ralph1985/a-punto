#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
backup_dir="$project_dir/var/backups/postgres"
latest="$(find "$backup_dir" -maxdepth 1 -type f -name 'a-punto-*.dump' -printf '%T@ %p\n' | sort -nr | head -n 1 | cut -d' ' -f2-)"

if [[ -z "$latest" ]]; then
  echo "No hay copia de A Punto para verificar." >&2
  exit 1
fi

pg_restore --list "$latest" >/dev/null
echo "Copia verificable: $latest"
