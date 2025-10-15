MWSI-HRIS

Full-stack HRIS built with Vite + React (frontend) and Node/Express + PostgreSQL (backend). Containerized for easy local development.

## Tech stack
- Frontend: Vite, React, TypeScript, shadcn-ui, Tailwind CSS
- Backend: Node.js (Express), TypeScript, JWT auth
- Database: PostgreSQL
- Tooling: Docker Compose

## Repository structure (abridged)
```
backend/            # Node/Express API
database/generated/ # SQL schema + seed files (applied by Docker on first run)
src/                # Frontend app (Vite + React)
docker-compose.yml  # db + backend + frontend dev stack
RUNNING.md          # Detailed run guide
docs/BACKEND_PLAN.md# Backend completion roadmap
```

## Quick start (Docker)

This runs Postgres, backend, and frontend together.

1) Preinstall backend deps once so Docker can build the image
```powershell
cd backend; npm install; cd ..
```

2) Start the stack
```powershell
docker-compose up --build
```

3) Open services
- Frontend: http://localhost:8080
- Backend:  http://localhost:5000
- Postgres: localhost:5432 (user: devuser, password: devpass, db: mwsi_hris_dev)

Reset DB (reapply schema + seed)
```powershell
docker-compose down -v; docker-compose up --build
```

More details are in `RUNNING.md`.

### Using shared development data (snapshots)

Fresh clones should get real data automatically on first run. We commit a compressed SQL snapshot and an init script that applies it after schema and seeds.

- Snapshot location: `database/snapshots/*.sql.gz`
- Init script: `database/init/99-apply-snapshots.sh`
- Compose mounts both into Postgres so snapshots are applied on a fresh volume

Generate a new snapshot from your current DB (Windows PowerShell):
```powershell
# Ensure stack is running and DB has desired data
scripts/export-db-snapshot.ps1
# This writes: database/snapshots/YYYY-MM-DD-dev-snapshot.sql.gz
# Commit the new file so teammates get the same data on fresh volumes
```

Apply snapshot on your machine (fresh DB):
```powershell
docker-compose down -v
docker-compose up --build
```
This drops the volume and reinitializes the DB with schema, seeds, and the committed snapshot.

## Local development without full Docker

Run DB in Docker, backend + frontend on host.

1) Start Postgres in Docker
```powershell
docker-compose up -d db
```

2) Backend (.env in `backend/`)
```
DATABASE_URL=postgres://devuser:devpass@localhost:5432/mwsi_hris_dev
PORT=5000
JWT_SECRET=dev-secret-change-me
```

Start backend
```powershell
cd backend
npm install
npm run dev
```

3) Frontend (from repo root)
```powershell
npm install
$env:VITE_API_BASE = "http://localhost:5000"
npm run dev -- --port 8080
```

## Environment variables
- Backend
	- `DATABASE_URL` (inside Docker defaults to `postgres://devuser:devpass@db:5432/mwsi_hris_dev`)
	- `PORT` (default 5000)
	- `JWT_SECRET` (set per environment)
	- `CORS_ORIGIN` (Docker sets `http://localhost:8080`)
- Frontend
	- `VITE_API_BASE` (Docker sets `http://localhost:5000`)

## Scripts
- Root (frontend)
	- `npm run dev` — Vite dev server
	- `npm run build` — build frontend
	- `npm run preview` — preview built frontend
	- `npm run lint` — lint
- Backend (`backend/`)
	- `npm run dev` — start API in watch mode
	- `npm run build` — compile TypeScript
	- `npm start` — run compiled API
	- `npm test` — run backend tests

## Troubleshooting
- Port conflicts (5432/5000/8080): stop other services or adjust ports in `docker-compose.yml`.
- CORS during local dev: either run Vite on 8080 to match Docker CORS origin or extend allowed origins in `backend/src/app.ts`.
- Re-seeding DB: `docker-compose down -v` then `docker-compose up --build`.

## Additional docs
- Detailed run steps: see `RUNNING.md`
- Backend roadmap: see `docs/BACKEND_PLAN.md`
