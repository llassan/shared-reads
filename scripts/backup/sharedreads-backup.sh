#!/usr/bin/env bash
# Nightly SharedReads Postgres backup.
# Local rotation (7 daily + 4 weekly) plus offsite push of recent dumps
# to the private llassan/shared-reads-backups GitHub repo via deploy key.
# Installed at ~/bin/sharedreads-backup.sh on the homeserver, run from cron.
set -euo pipefail

COMPOSE_DIR="$HOME/shared-reads"
BACKUP_DIR="$HOME/backups/sharedreads"
OFFSITE_DIR="$HOME/backups/sharedreads-offsite"
STAMP=$(date -u +%Y%m%d-%H%M%S)
DAY=$(date -u +%u) # 7 = Sunday

mkdir -p "$BACKUP_DIR/daily" "$BACKUP_DIR/weekly"

DUMP="$BACKUP_DIR/daily/sharedreads-$STAMP.sql.gz"
docker compose --project-directory "$COMPOSE_DIR" exec -T db \
  pg_dump -U sharedreads --no-owner sharedreads | gzip > "$DUMP"

# a valid dump of even an empty schema is well over 1 KB compressed
if [ "$(stat -c%s "$DUMP")" -lt 1024 ]; then
  echo "ERROR: dump suspiciously small: $DUMP" >&2
  exit 1
fi

if [ "$DAY" = 7 ]; then
  cp "$DUMP" "$BACKUP_DIR/weekly/"
fi

# retention: 7 daily, 4 weekly
ls -1t "$BACKUP_DIR/daily/"*.sql.gz | tail -n +8 | xargs -r rm --
ls -1t "$BACKUP_DIR/weekly/"*.sql.gz 2>/dev/null | tail -n +5 | xargs -r rm --

# offsite: dated dump + rolling "latest", keep 14 dated dumps in the repo
cp "$DUMP" "$OFFSITE_DIR/"
cp "$DUMP" "$OFFSITE_DIR/sharedreads-latest.sql.gz"

# uploaded images: mirror into the offsite repo (content-unique files, so git
# stores each image once). Warn rather than push if the dir grows huge.
UPLOADS_SRC="$COMPOSE_DIR/data/uploads"
if [ -d "$UPLOADS_SRC" ]; then
  UPLOADS_MB=$(du -sm "$UPLOADS_SRC" | cut -f1)
  if [ "$UPLOADS_MB" -lt 500 ]; then
    rsync -a --delete "$UPLOADS_SRC/" "$OFFSITE_DIR/uploads/"
  else
    echo "WARN: uploads dir is ${UPLOADS_MB}MB — skipping git offsite; move image backups to object storage" >&2
  fi
fi

cd "$OFFSITE_DIR"
ls -1t sharedreads-2*.sql.gz | tail -n +15 | xargs -r rm --
git add -A
if git -c user.name=backup-bot -c user.email=backup@sharedreads.com commit -q -m "backup $STAMP"; then
  git push -q origin main
fi
echo "OK: $DUMP"
