#!/bin/sh
set -e

echo "[initdb] Applying snapshots if present..."
SNAP_DIR="/docker-entrypoint-initdb.d/snapshots"

if [ -d "$SNAP_DIR" ]; then
  for f in "$SNAP_DIR"/*; do
    [ -e "$f" ] || continue
    case "$f" in
      *.sql)
        echo "[initdb] Applying SQL: $f"
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f"
        ;;
      *.sql.gz)
        echo "[initdb] Applying SQL.GZ: $f"
        gunzip -c "$f" | psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
        ;;
      *)
        echo "[initdb] Skipping unknown file: $f"
        ;;
    esac
  done
else
  echo "[initdb] No snapshots directory found at $SNAP_DIR"
fi

echo "[initdb] Snapshot application complete."