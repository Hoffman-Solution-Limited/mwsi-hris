# Backend Completion Plan

This plan outlines the remaining work to complete a production-ready backend for MWSI-HRIS. It prioritizes correctness, security, observability, and maintainability.

## Target Architecture
- Node.js (Express) API with TypeScript
- PostgreSQL (SQL-first, migrations)
- Stateless JWT auth
- Containerized with Docker
- CI: build, lint, test; CD optional

## Environments
- Local dev: docker-compose (db, backend, frontend)
- Staging/Prod: Docker or managed Postgres + Node service

## Workstreams and Milestones

### 1) Authentication & Authorization
- [ ] Harden login: rate limiting, constant-time comparisons, clear error messages
- [ ] Password reset flow (token table + expiry)
- [ ] Enforce password policy (min length, complexity)
- [ ] Refresh tokens or short-lived tokens + rotation (optional)
- [ ] Role-based authorization middleware coverage across routes
- [ ] CORS configuration by env

Acceptance: Integration tests for login/refresh; protected endpoints require valid token & role.

### 2) Database Migrations & Seed
- [ ] Adopt a migration tool (e.g., node-pg-migrate, Knex, or SQL-based Flyway-like approach)
- [ ] Convert current SQL in database/generated into ordered migrations
- [ ] Add seed scripts for dev/demo data
- [ ] Add npm scripts: `migrate:up`, `migrate:down`, `seed`

Acceptance: Fresh DB can be provisioned with one command; down/up cycles are deterministic.

### 3) Domain Modules (CRUD + Business Rules)
Ensure each router has complete CRUD and key business rules. Current routers:
- Users
- Employees
- Roles
- Positions
- Leaves
- Trainings
- Disciplinary
- Performance
- Department Goals
- System Logs

Tasks (repeatable per module):
- [ ] Define validated DTOs with Zod
- [ ] CRUD endpoints (list/filter, get, create, update, delete/soft-delete)
- [ ] Input validation, authorization, and ownership rules
- [ ] Pagination, sorting, filtering
- [ ] Consistent error handling
- [ ] Unit + integration tests (happy path + 1-2 edges)

Acceptance: Coverage of primary paths; Postman/Insomnia collection or REST tests pass.

### 4) Logging & Auditing
- [ ] Request logging (morgan or pino-http); redact sensitive fields
- [ ] System logs table writes for critical actions
- [ ] Correlation IDs via request header or generated UUID

Acceptance: Traceability across key write operations.

### 5) Validation & Error Handling
- [ ] Centralized error handler
- [ ] Zod schemas for request bodies and query params
- [ ] Meaningful error codes/messages

Acceptance: Invalid input produces 4xx with structured error payload.

### 6) Performance & N+1
- [ ] Query indexes for hot paths
- [ ] Use transactions for multi-step writes
- [ ] Batch reads where appropriate

Acceptance: Baseline load test shows acceptable latency with sample data.

### 7) Security
- [ ] Helmet for HTTP headers
- [ ] Strict CORS by environment
- [ ] Avoid leaking stack traces in prod
- [ ] Secure JWT secret handling (env/secret store)

Acceptance: OWASP checks pass; no secrets in repo.

### 8) Observability
- [ ] Health and readiness endpoints (`/health`, `/ready`)
- [ ] Basic metrics (e.g., Prometheus format) optional

Acceptance: Health endpoints reflect DB connectivity.

### 9) CI/CD
- [ ] GitHub Actions workflow
  - Install, lint, test, build backend
  - Cache dependencies
- [ ] Optional: Docker build & push

Acceptance: PRs run green pipeline; main branch builds artifacts.

### 10) Developer Experience
- [ ] Update RUNNING.md with migration and seed steps (done for base run)
- [ ] Add API reference docs (OpenAPI or minimal markdown)
- [ ] Prettier/ESLint consistent configs

Acceptance: New developer can run and contribute within 15 minutes.

## Suggested Folder/Additions
- backend/src/middleware/
  - errorHandler.ts
  - rateLimit.ts (or express-rate-limit)
  - requestId.ts
- backend/src/validation/*.ts (Zod schemas per module)
- backend/src/logging/*.ts
- backend/migrations/*.sql
- backend/scripts/seed.ts
- docs/api/*.md (or OpenAPI spec)

## Minimal Contracts per Endpoint
- Inputs: JSON bodies validated by Zod
- Outputs: JSON with data or `{ error }`
- Errors: 400 (validation), 401/403 (auth), 404 (missing), 409 (conflicts), 500 (unexpected)

## Next Concrete Steps
1) Introduce migration tool and port SQL files to migrations; add scripts
2) Add helmet, centralized error handler, and rate limiting
3) Add Zod schemas and wire into 2-3 key routers
4) Write integration tests for auth and users
5) Add GitHub Actions workflow for backend

Once the above are done, iterate module by module using the checklist in Workstream 3.
