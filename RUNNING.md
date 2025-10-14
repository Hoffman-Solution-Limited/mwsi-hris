Local development with Postgres backend (Docker)

Start the stack:

1. cd backend; npm install; cd ..
2. docker-compose up --build

Services:
- Postgres DB on localhost:5432 (user: devuser, password: devpass, db: mwsi_hris_dev)
- Backend API (container) on port 5000

To run the backend locally without Docker:

cd backend
npm install
npm run dev
