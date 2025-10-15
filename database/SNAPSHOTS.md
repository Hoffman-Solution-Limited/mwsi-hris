Database snapshots for reproducible developer data.

How it works
- docker-compose mounts ./database/init/99-apply-snapshots.sh and ./database/snapshots into the Postgres init dir
- On a fresh volume, Postgres loads schema/seeds, then the init script applies any .sql or .sql.gz files in /docker-entrypoint-initdb.d/snapshots

Creating a new snapshot
1) Ensure containers are up and DB has the desired data.
2) Run the export script (Windows PowerShell): scripts/export-db-snapshot.ps1
3) This creates database/snapshots/YYYY-MM-DD-dev-snapshot.sql.gz — optionally rename to something meaningful.
4) Commit it. New clones with a fresh db volume will get this data applied automatically.

Loading order
- Schema files (01-*.sql) load first
- Seed files (02-*.sql, etc.)
- Init script runs and applies snapshots (*.sql or *.sql.gz) afterwards

Notes
- Snapshots should not include DROP DATABASE or destructive DDL; aim for INSERT/UPDATE/UPSERT statements.
- Keep one latest snapshot to reduce clone size; prune older snapshots when creating a new one.
