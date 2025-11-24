# MWSI HR Management System - Database Documentation

## Overview
This database schema is designed for a comprehensive HR Management System with the following modules:

- **Employee Management**: Core employee data and directory
- **Leave Management**: Leave types, requests, and approvals
- **Performance Management**: Review templates and employee evaluations
- **Training Management**: Training programs and enrollments
- **Disciplinary Management**: Case tracking with status history
- **Document Management**: File storage and tracking
- **Recruitment**: Job postings and applications
- **Notifications**: User notifications system
- **System Logs**: Activity tracking and auditing

## Database Schema Files

### schema.sql
Complete SQL schema with:
- All table definitions
- Foreign key relationships
- Indexes for performance optimization
- Triggers for automatic timestamp updates
- Row Level Security (RLS) policies
# Database (generated)

This file documents the generated schema and seed files located in `database/generated/`.
They were produced from the front-end mock data in `src/data/mockData.ts` and adjusted to match runtime shapes used by the UI (notably: file tracking, document types and system catalog values).

Summary
-------
- `generated/mock-schema.sql` — PostgreSQL DDL matching front-end shapes.
- `generated/mock-seed.sql` — INSERTs derived from the front-end mock arrays to populate a development DB.

Key tables (high level)
-----------------------
- `employees` — core employee records (fields mirror `src/data` Employee type)
- `departments` — lightweight table; `id` values intentionally match front-end `employee.department` strings (see "Department matching" below)
- `employee_skills`, `positions`, `training_records`, `leave_requests` — match front-end shapes
- Performance tables: `performance_templates`, `performance_template_criteria`, `performance_reviews`, `employee_targets`, `performance_scores`
- Disciplinary: `disciplinary_cases`, `disciplinary_case_updates`
- File tracking and document types (matches `FileTrackingContext`):
	- `document_types` — flexible document names
	- `employee_files` — one physical file per employee; `default_documents` stored as TEXT[]
	- `file_movements` — movement history entries matching MovementEntry
	- `file_requests` — requests created by managers/HR
- System catalogs: `system_designations`, `system_skill_levels`, `system_stations`, `system_job_groups`, `system_engagement_types`, `system_ethnicities`

Department matching
-------------------
The front-end stores the department as a plain string on each employee (for example `employee.department = 'IT'`).
The generated seed inserts `departments` rows where `departments.id` equals those strings so that seeded department rows line up with `employee.department` values. Example seeded ids: `IT`, `Human Resources`, `Engineering`, `Marketing`, `Finance`, `Operations`, `Registry`.

Applying schema & seed (Postgres, PowerShell examples)
----------------------------------------------------
Replace credentials/host/dbname with your values.

Apply schema:

```powershell
psql "postgresql://<user>:<password>@<host>:<port>/<dbname>" -f .\database\generated\mock-schema.sql
```

Apply seed:

```powershell
psql "postgresql://<user>:<password>@<host>:<port>/<dbname>" -f .\database\generated\mock-seed.sql
```

Quick syntax check (wrap in transaction and rollback):

```powershell
psql "postgresql://<user>:<password>@<host>:<port>/<dbname>" -c "BEGIN; \i .\database\generated\mock-schema.sql; ROLLBACK;"
```

Notes & recommendations
-----------------------
- IDs: the generated schema uses VARCHAR ids to match front-end mock IDs. If you prefer UUIDs, I can convert the schema and regenerate the seed (this requires coordination if the front-end is using those string ids).
- Referential integrity: currently `employees.department` is a string. If you'd like, I can add a foreign-key constraint from `employees.department` -> `departments.id` (safe because the seed is consistent).
- Normalization: `employee_files.default_documents` is a TEXT[] for convenience and maps directly to the front-end `defaultDocuments` array. If the backend prefers normalized rows, we can introduce `file_documents(employee_id, document_type)`.
- Migrations: move files into a migrations tool (Flyway/Knex) for incremental updates in production.

Next steps I can implement for you
---------------------------------
- Add FK constraint employees.department -> departments.id
- Convert IDs to UUIDs and update seeds
- Normalize document arrays into `file_documents`
- Add example queries and a short section on how the front-end uses file movements/requests

If you'd like me to make any of the above changes, tell me which one and I will update the schema and seed accordingly.

---

Table reference (for backend developers)
--------------------------------------
The following documents each table you'll find in `generated/mock-schema.sql`. For each table I list the purpose, key columns, relationships, and a couple of example queries that backend engineers will find useful when integrating the API.

1) employees
	 - Purpose: Master record for every employee used across the app.
	 - Key columns:
		 - id (VARCHAR) — primary key (keeps front-end mock id strings)
		 - employee_number (VARCHAR) — human identifier used on forms/registry
		 - name, email, position, department, station_name
		 - hire_date, status, salary, gender, national_id
		 - created_at, updated_at
	 - Relationships: referenced by many tables (leave_requests, performance_reviews, training_records, employee_files, disciplinary_cases)
	 - Example queries:
		 - Get employee by id: SELECT * FROM employees WHERE id = '3';
		 - List employees in a department: SELECT id, name, position FROM employees WHERE department = 'Engineering';

2) departments
	 - Purpose: Lightweight list of departments used for filtering and display. `id` intentionally equals the string used by the front-end (e.g. 'IT').
	 - Key columns: id (VARCHAR PK), name
	 - Example query: SELECT id, name FROM departments ORDER BY name;

3) employee_skills
	 - Purpose: One-to-many skills per employee (name, level)
	 - Key columns: id (SERIAL PK), employee_id (FK), name, level
	 - Example query: SELECT name, level FROM employee_skills WHERE employee_id = '1';

4) positions
	 - Purpose: Recruitment jobs and open positions
	 - Key columns: id, title, department, status, applicants, posted_date, closing_date
	 - Example query: SELECT * FROM positions WHERE status = 'open';

5) training_records
	 - Purpose: Employee training history (completed/in progress)
	 - Key columns: id, employee_id, title, type, status, completion_date, expiry_date
	 - Example query: SELECT * FROM training_records WHERE employee_id = '3' ORDER BY created_at DESC;

6) leave_requests
	 - Purpose: Track employee leave applications and approvals
	 - Key columns: id, employee_id, type, start_date, end_date, days, status, applied_date, manager_comments, approved_by
	 - Example query: SELECT * FROM leave_requests WHERE status = 'pending_manager';

7) performance_templates
	 - Purpose: Templates used to create performance reviews
	 - Key columns: id, name, type, description, department, created_by
	 - Related table: performance_template_criteria (criteria for each template)

8) performance_template_criteria
	 - Purpose: Criteria (quality, teamwork...) associated with a template
	 - Key columns: id, template_id (FK), criteria_id, name, weight

9) performance_reviews
	 - Purpose: Per-employee reviews created from templates
	 - Key columns: id, employee_id, template_id, review_period, status, overall_score, goals (TEXT[]), next_review_date
	 - Related tables: employee_targets, performance_scores
	 - Example query: SELECT * FROM performance_reviews WHERE employee_id = '10' ORDER BY created_at DESC;

10) employee_targets
		- Purpose: Targets/tactical items set per review
		- Key columns: id, review_id (FK), criteria_id, target, description

11) performance_scores
		- Purpose: Per-criteria scores by employee/manager
		- Key columns: id, review_id (FK), criteria_id, score_by, score, comments

12) disciplinary_cases
		- Purpose: Store disciplinary case metadata and status
		- Key columns: id, employee_id, case_type, status, date, description, verdict
		- Related: disciplinary_case_updates
		- Example query: SELECT * FROM disciplinary_cases WHERE status = 'open';

13) disciplinary_case_updates
		- Purpose: Time-ordered updates/comments for a disciplinary case
		- Key columns: id, case_id (FK), timestamp, text

14) document_types
		- Purpose: Flexible registry of required document names (managed by UI)
		- Key columns: name (PK)
		- Note: front-end allows adding new document type strings at runtime. Backend should accept these values.

15) employee_files
		- Purpose: One row per employee representing their physical file in the registry system
		- Key columns:
			- employee_id (PK, FK to employees.id)
			- current_location (string, e.g., 'Registry Office')
			- assigned_user_id, assigned_user_name
			- default_documents (TEXT[]) — list of document type names present/expected on the physical file
		- Example queries:
			- Get file and default documents for employee: SELECT * FROM employee_files WHERE employee_id = '1';
			- Find files missing a document (example using array operator):
				SELECT employee_id FROM employee_files WHERE NOT (default_documents @> ARRAY['KRA_PIN']);

16) file_movements
		- Purpose: Movement history for files (mirrors MovementEntry in front-end)
		- Key columns: id, employee_id (FK), by_user_id, by_user_name, from_location, to_location, timestamp, remarks
		- Example query: SELECT * FROM file_movements WHERE employee_id = '1' ORDER BY timestamp DESC;

17) file_requests
		- Purpose: Requests created by managers/HR to access employee files
		- Key columns: id, file_id (FK to employee_files.employee_id), employee_id, document_type, requested_by_user_id, status, created_at, remarks
		- Example query: SELECT * FROM file_requests WHERE status = 'pending' ORDER BY created_at DESC;

18) system_* tables (designations, skill_levels, stations, job_groups, engagement_types, ethnicities)
		- Purpose: Lookup/catalog tables used by the UI. Seeded from `src/data/mockData.ts` to make the system feel populated.
		- Example query: SELECT name FROM system_stations ORDER BY name;

Common integration tips
-----------------------
- If you plan to enforce foreign keys, add `employees.department` -> `departments.id` (seed matches current strings). I can add an ALTER TABLE statement if you want.
- The front-end currently uses string ids for employees (e.g., '1', '10'). If backend wants strictly typed UUIDs, convert schema and update seed; front-end must be updated to use UUIDs or mapping applied in backend.
- Array columns (TEXT[]) are used for convenience for `employee_files.default_documents` and `performance_reviews.goals`. If the backend prefers normalized structures, create join tables and I will update the seed.

Example useful queries (combined)
--------------------------------
- Files currently assigned to a user:
	SELECT f.employee_id, e.name, f.current_location FROM employee_files f JOIN employees e ON e.id = f.employee_id WHERE f.assigned_user_id = '2';

- Pending file requests with requester info:
	SELECT r.id, r.employee_id, r.document_type, r.requested_by_name, r.created_at FROM file_requests r WHERE r.status = 'pending' ORDER BY r.created_at DESC;

If you'd like, I'll add an explicit foreign key for `employees.department` -> `departments.id`, or convert default_documents to a normalized `file_documents` table and regenerate seed data. Tell me which change to apply next and I'll update schema + seed.

