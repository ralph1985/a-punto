#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
cron_block="# BEGIN A-PUNTO BACKUP
CRON_TZ=Europe/Madrid
0 1 * * * /usr/bin/flock -n /tmp/a-punto-postgres-backup.lock $project_dir/scripts/backup-postgres.sh >> $project_dir/var/log/postgres-backup.cron.log 2>&1
# END A-PUNTO BACKUP"
current="$(crontab -l 2>/dev/null || true)"
cleaned="$(printf '%s\n' "$current" | sed '/^# BEGIN A-PUNTO BACKUP$/,/^# END A-PUNTO BACKUP$/d')"
printf '%s\n%s\n' "$cleaned" "$cron_block" | crontab -
crontab -l
