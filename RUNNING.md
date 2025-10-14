Project run guide (Windows-friendly)

This project has a Vite React frontend and a Node/Express + Postgres backend. You can run everything with Docker (recommended) or run services locally.

Prerequisites
- Docker Desktop installed and running
- Node.js 20.x and npm (if running locally outside Docker)

Option A: Run everything with Docker (recommended)
1) Install backend dependencies once so Docker builds succeed
	 - In PowerShell from repo root:
		 - cd backend; npm install; cd ..

2) Start the full stack
	 - docker-compose up --build

	 Services exposed:
	 - Postgres: localhost:5432
		 - user: devuser, password: devpass, db: mwsi_hris_dev
	 - Backend API: http://localhost:5000
	 - Frontend (Vite): http://localhost:8080

	 Notes
	 - Frontend uses VITE_API_BASE to call the backend; docker-compose sets VITE_API_BASE=http://localhost:5000 so calls go to the backend container.
	 - Database is initialized with schema and seed SQL files from database/generated via docker-entrypoint-initdb.d.
	 - Files are volume-mounted for the frontend so edits on host trigger hot reload.

3) Tear down
	 - Press Ctrl+C to stop
	 - docker-compose down (to remove containers)

Reset database (Docker)
- docker-compose down -v  # removes containers and the db_data volume
- docker-compose up --build  # re-creates DB and re-applies seed SQL

Option B: Run backend locally, DB in Docker, frontend locally
Run Postgres in Docker
- docker-compose up -d db

Configure environment
- Create backend/.env with:
	- DATABASE_URL=postgres://devuser:devpass@localhost:5432/mwsi_hris_dev
	- PORT=5000
	- JWT_SECRET=dev-secret-change-me

Start backend locally
- cd backend
- npm install
- npm run dev
- Backend runs at http://localhost:5000

Start frontend locally
- From repo root
- npm install
- Set Vite env (optional; defaults to no prefix so api.ts builds URLs using VITE_API_BASE if provided):
	- PowerShell (session): $env:VITE_API_BASE = "http://localhost:5000"
- npm run dev
- Frontend at http://localhost:8080 (Vite default is 5173, but we pin 8080 in Docker; locally it will be whatever Vite prints unless you pass --port 8080)

Environment variables summary
- Backend
	- DATABASE_URL (default inside containers: postgres://devuser:devpass@db:5432/mwsi_hris_dev)
	- PORT (default 5000)
	- JWT_SECRET (default dev-secret-change-me)
	- CORS_ORIGIN (docker-compose sets http://localhost:8080)
- Frontend
	- VITE_API_BASE (docker-compose sets http://localhost:5000)

Health check
- Backend: GET http://localhost:5000/health should return {"status":"ok"}

Troubleshooting
- Port conflicts:
	- If 5432/5000/8080 are in use, stop the conflicting processes or update ports in docker-compose.yml and frontend .env.
- Windows file watching:
	- docker-compose sets CHOKIDAR_USEPOLLING and WATCHPACK_POLLING for hot reload inside containers.
- Cannot connect to DB from backend locally:
	- Ensure DATABASE_URL points to localhost, not db, when running backend outside Docker.
	- Verify container is up: docker ps; logs: docker-compose logs -f db
- Re-seeding data:
	- Use docker-compose down -v then up to re-apply init SQL files.

