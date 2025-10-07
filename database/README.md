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

## Key Tables

### Core Tables
- `employees` - Employee master data
- `users` - Authentication and role management
- `departments` - Department information

### Leave Management
- `leave_types` - Types of leave available
- `leave_requests` - Employee leave applications

### Performance Management
- `performance_templates` - Review templates with criteria
- `performance_reviews` - Employee review records

### Training Management
- `training_programs` - Available training courses
- `training_enrollments` - Employee training records

### Disciplinary Management
- `disciplinary_cases` - Case records
- `disciplinary_case_updates` - Complete status update history

### Document & File Management
- `documents` - Document metadata and storage
- `employee_files` - Physical file tracking
- `file_movements` - File movement history

### System Management
- `notifications` - User notifications
- `system_logs` - System activity logs
- `system_settings` - Configuration settings
- `permissions` - Permission definitions
- `role_permissions` - Role-based access control

## User Roles

The system supports 5 user roles:
1. **admin** - Full system access
2. **hr** - HR operations and management
3. **manager** - Team management capabilities
4. **employee** - Basic employee access
5. **registry** - File and document management

## Security Features

### Row Level Security (RLS)
RLS policies ensure:
- Employees can only view their own records
- Managers can view their team's data
- HR and Admins have full access
- Notifications are user-specific

### Audit Trail
- All tables include `created_at` and `updated_at` timestamps
- `system_logs` table tracks all user actions
- Disciplinary cases maintain full status update history

## Relationships

### Key Foreign Keys
- `users.employee_id` → `employees.id`
- `leave_requests.employee_id` → `employees.id`
- `performance_reviews.employee_id` → `employees.id`
- `training_enrollments.employee_id` → `employees.id`
- `disciplinary_cases.employee_id` → `employees.id`

## Indexes

Performance indexes are created on:
- Email addresses (for login lookups)
- Employee IDs (for joins)
- Status fields (for filtering)
- Date fields (for reporting)
- User-specific queries (for dashboards)

## Installation

### Using Lovable Cloud (Supabase)

1. Navigate to the Cloud tab in Lovable
2. Go to SQL Editor
3. Copy the contents of `schema.sql`
4. Execute the SQL to create all tables

### Manual Installation

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Execute the schema file
\i database/schema.sql
```

## Data Migration

To migrate from mock data to database:
1. Export current mock data from the application
2. Transform data to match schema
3. Use INSERT statements or data import tools
4. Verify data integrity

## Maintenance

### Backup Strategy
- Daily automated backups recommended
- Weekly full database dumps
- Transaction log backups every hour

### Performance Monitoring
Monitor these indexes for optimization:
- `idx_employees_department`
- `idx_leave_requests_employee`
- `idx_performance_reviews_employee`
- `idx_notifications_user_read`

### Regular Tasks
- Monthly: Review and archive old notifications
- Quarterly: Analyze and optimize slow queries
- Annually: Archive completed disciplinary cases

## API Integration

All tables are accessible through Lovable Cloud's automatic REST API:
- GET /employees
- POST /leave_requests
- PATCH /performance_reviews/{id}
- DELETE /notifications/{id}

## Support

For questions about the database schema:
1. Check this README
2. Review the inline comments in schema.sql
3. Consult Lovable Cloud documentation
4. Contact your database administrator
