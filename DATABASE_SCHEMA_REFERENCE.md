# WorkloadWizard Database Schema Reference

## Overview
This document outlines the complete database schema for WorkloadWizard, a comprehensive academic workload management system. The schema is designed with normalization principles, profile-based data structures, and academic year scoping.

## Core Design Principles

### 1. Profile-Based Architecture
- **Core Data**: Stored in `_profiles` tables (e.g., `lecturer_profiles`, `module_profiles`)
- **Year-Specific Data**: Stored in instance tables (e.g., `lecturers`, `modules`) linked to `academic_years`
- **Benefits**: Allows entities to transfer between academic years while maintaining year-specific values

### 2. Academic Year Scoping
- All operational data is scoped to specific academic years
- Academic years can be "active" (current viewing) or "staging" (planning)
- Data automatically transfers to new academic years with reset values

### 3. Normalized Structure
- JSON fields replaced with dedicated relational tables
- Enum/reference tables for standardized values
- Proper foreign key relationships throughout

### 4. Audit & Tracking
- Comprehensive audit logging with polymorphic associations
- Soft deletes with `deleted_at` timestamps
- Data migration tracking for schema evolution

## Table Categories

### 1. Core Organization Tables
- `organisations` - Main organization data
- `user_roles` - Role definitions
- `users` - Core user data
- `user_profiles` - Extended user information
- `user_settings` - User preferences
- `user_preferences` - Key-value user preferences

### 2. Academic Structure Tables
- `academic_years` - Academic year definitions
- `semester_periods` - Semester date ranges
- `departments` - Department structure
- `faculties` - Faculty structure
- `teams` - Team/department groupings

### 3. Staff Management Tables
- `lecturer_profiles` - Core lecturer information
- `lecturer_statuses` - Lecturer status options
- `lecturers` - Year-specific lecturer data
- `admin_allocation_categories` - Admin allocation types
- `admin_allocations` - Lecturer admin allocations

### 4. Course & Module Tables
- `courses` - Course definitions
- `cohorts` - Student cohorts
- `modules` - Module definitions
- `course_modules` - Course-module relationships
- `cohort_module_plans` - Cohort-specific module delivery

### 5. Module Delivery Tables
- `module_iterations` - Module delivery instances
- `module_iteration_groups` - Group configurations
- `sites` - Physical locations
- `assessment_types` - Assessment type definitions
- `module_iteration_assessments` - Module assessments
- `allocation_types` - Allocation type definitions
- `module_allocations` - Lecturer module allocations

### 6. Reporting & Analytics Tables
- `team_summaries` - Calculated team metrics
- `workload_reports` - Workload summaries
- `workload_calculation_rules` - Custom calculation formulas

### 7. System Tables
- `organisation_settings` - Organization configuration
- `notification_settings` - User notification preferences
- `external_systems` - Integration configurations
- `data_sync_logs` - Sync operation tracking
- `report_templates` - Report definitions
- `scheduled_reports` - Automated report scheduling
- `user_sessions` - Session management
- `audit_logs` - System audit trail
- `data_migrations` - Migration tracking
- `roles` - RBAC role definitions
- `user_role_assignments` - User-role relationships
- `events` - Domain event tracking
- `file_attachments` - File storage
- `tags` - Tagging system
- `taggables` - Tag associations

## Key Relationships

### Academic Year Hierarchy
```
academic_years
├── lecturers (year-specific)
├── module_iterations (year-specific)
├── admin_allocations (year-specific)
├── cohort_module_plans (year-specific)
└── team_summaries (year-specific)
```

### Profile-Based Entity Structure
```
lecturer_profiles
└── lecturers (academic_year_id, profile_id)

modules
└── module_iterations (academic_year_id, module_id)
```

### Course-Module-Cohort Structure
```
courses
├── cohorts
│   └── cohort_module_plans (academic_year_id)
│       └── module_iterations
│           ├── module_iteration_groups
│           ├── module_iteration_assessments
│           └── module_allocations
└── course_modules
    └── modules
```

## Data Flow Patterns

### 1. Academic Year Creation
1. Create `academic_year` record
2. Auto-populate with existing `lecturer_profiles` → `lecturers`
3. Auto-populate with existing `modules` → `module_iterations`
4. Reset year-specific values to defaults

### 2. Entity Creation
- **New Profile**: Create in `_profiles` table + instance in current academic year
- **Existing Profile**: Create instance in specific academic year only
- **Year-Specific Data**: Always scoped to academic year

### 3. Data Migration
- Profile migration: Split existing records into profiles + instances
- Academic year migration: Assign unassigned records to specific years

## Implementation Notes

### Convex Schema Mapping
- Use `v.id()` for primary keys
- Use `v.optional(v.id())` for nullable foreign keys
- Use `v.string()` for varchar/text fields
- Use `v.float64()` for numeric fields
- Use `v.boolean()` for boolean fields
- Use `v.number()` for timestamps

### Indexing Strategy
- Index all foreign key columns
- Index `academic_year_id` for performance
- Index `organisation_id` for multi-tenancy
- Index `created_at` for chronological queries

### Soft Delete Pattern
- Use `deleted_at` timestamp for soft deletes
- Filter out soft-deleted records in queries
- Maintain referential integrity

### Audit Logging
- Log all create/update/delete operations
- Use polymorphic associations for flexible logging
- Include user context and IP information

## Migration Strategy

### Phase 1: Core Tables
1. Create new normalized tables
2. Migrate existing data to new structure
3. Update API functions

### Phase 2: Profile Migration
1. Create profile tables
2. Migrate existing records to profile structure
3. Update all references

### Phase 3: Academic Year Integration
1. Add academic year scoping
2. Migrate existing data to default academic year
3. Update UI to support academic year selection

### Phase 4: Advanced Features
1. Implement RBAC system
2. Add reporting and analytics
3. Implement notification system

## Performance Considerations

### Query Optimization
- Use proper indexing on frequently queried columns
- Implement pagination for large datasets
- Use efficient joins for related data

### Caching Strategy
- Cache academic year context
- Cache frequently accessed lookup data
- Implement query result caching

### Data Volume Management
- Archive old academic year data
- Implement data retention policies
- Use soft deletes for data recovery

## Security Considerations

### Multi-Tenancy
- All data scoped to organization
- User access controlled by organization membership
- API functions validate organization context

### Role-Based Access
- Granular permissions per role
- User-role assignments with expiration
- Audit logging for all access

### Data Protection
- Encrypt sensitive data
- Implement proper session management
- Regular security audits

## Future Enhancements

### Scalability
- Horizontal scaling with sharding
- Read replicas for reporting
- Microservice architecture

### Integration
- External system connectors
- API webhooks
- Data import/export tools

### Analytics
- Advanced reporting engine
- Real-time dashboards
- Predictive analytics 