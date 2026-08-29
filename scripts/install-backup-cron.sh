#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
node_bin="${NODE_BIN:-$(command -v node || true)}"

if [[ -z "$node_bin" ]]; then
  echo "No se encuentra Node.js para instalar el cron de A Punto." >&2
  exit 1
fi

cron_block="# BEGIN A-PUNTO BACKUP
CRON_TZ=Europe/Madrid
0 1 * * * /usr/bin/env NODE_BIN=$node_bin /usr/bin/flock -n /tmp/a-punto-postgres-backup.lock $project_dir/scripts/backup-postgres.sh >> $project_dir/var/log/postgres-backup.cron.log 2>&1
# END A-PUNTO BACKUP"
current="$(crontab -l 2>/dev/null || true)"
cleaned="$(printf '%s\n' "$current" | sed '/^# BEGIN A-PUNTO BACKUP$/,/^# END A-PUNTO BACKUP$/d')"
printf '%s\n%s\n' "$cleaned" "$cron_block" | crontab -
crontab -l
