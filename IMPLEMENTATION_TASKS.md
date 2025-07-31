# WorkloadWizard Database Implementation Tasks

## Phase 1: Core Schema Implementation

### 1.1 Create New Convex Schema Files

#### Priority: CRITICAL
- [ ] **convex/user_roles.ts** - User role definitions and API
- [ ] **convex/user_profiles.ts** - User profile management
- [ ] **convex/user_settings.ts** - User settings management
- [ ] **convex/user_preferences.ts** - User preferences (key-value)
- [ ] **convex/departments.ts** - Department structure
- [ ] **convex/faculties.ts** - Faculty structure
- [ ] **convex/semester_periods.ts** - Semester date management
- [ ] **convex/sites.ts** - Physical location management
- [ ] **convex/assessment_types.ts** - Assessment type definitions
- [ ] **convex/allocation_types.ts** - Allocation type definitions
- [ ] **convex/courses.ts** - Course management
- [ ] **convex/cohorts.ts** - Cohort management
- [ ] **convex/course_modules.ts** - Course-module relationships
- [ ] **convex/cohort_module_plans.ts** - Cohort-specific module delivery
- [ ] **convex/module_iteration_groups.ts** - Module iteration groups
- [ ] **convex/module_iteration_assessments.ts** - Module assessments
- [ ] **convex/team_summaries.ts** - Team metrics calculation
- [ ] **convex/workload_reports.ts** - Workload reporting
- [ ] **convex/workload_calculation_rules.ts** - Custom calculation rules
- [ ] **convex/organisation_settings.ts** - Organization configuration
- [ ] **convex/notification_settings.ts** - Notification preferences
- [ ] **convex/external_systems.ts** - External system integrations
- [ ] **convex/data_sync_logs.ts** - Sync operation tracking
- [ ] **convex/report_templates.ts** - Report template management
- [ ] **convex/scheduled_reports.ts** - Automated report scheduling
- [ ] **convex/user_sessions.ts** - Session management
- [ ] **convex/audit_logs.ts** - Audit trail system
- [ ] **convex/data_migrations.ts** - Migration tracking
- [ ] **convex/roles.ts** - RBAC role definitions
- [ ] **convex/user_role_assignments.ts** - User-role relationships
- [ ] **convex/events.ts** - Domain event tracking
- [ ] **convex/file_attachments.ts** - File storage system
- [ ] **convex/tags.ts** - Tagging system
- [ ] **convex/taggables.ts** - Tag associations

### 1.2 Update Existing Schema Files

#### Priority: CRITICAL
- [ ] **convex/organisations.ts** - Remove JSON fields, add new columns
- [ ] **convex/users.ts** - Split into core + profile structure
- [ ] **convex/teams.ts** - Add department/faculty relationships
- [ ] **convex/lecturers.ts** - Update to use profile structure
- [ ] **convex/modules.ts** - Update to use profile structure
- [ ] **convex/module_iterations.ts** - Update relationships and structure
- [ ] **convex/admin_allocations.ts** - Update to use new categories

### 1.3 Update Convex Schema Definition

#### Priority: CRITICAL
- [ ] **convex/schema.ts** - Add all new table definitions
- [ ] **convex/auth.config.ts** - Update authentication rules for new tables
- [ ] **convex/_generated/** - Regenerate API types after schema changes

## Phase 2: Data Migration Implementation

### 2.1 Migration Scripts

#### Priority: HIGH
- [ ] **convex/migrations.ts** - Update existing migration functions
- [ ] **convex/migrations/profile-migration.ts** - Profile structure migration
- [ ] **convex/migrations/academic-year-migration.ts** - Academic year assignment
- [ ] **convex/migrations/data-normalization.ts** - JSON field normalization
- [ ] **convex/migrations/seed-data.ts** - Seed reference data (roles, types, etc.)

### 2.2 Migration UI Components

#### Priority: HIGH
- [ ] **src/components/features/dev-tools/data-migration.tsx** - Update migration UI
- [ ] **src/components/features/dev-tools/migration-status.tsx** - Migration progress tracking
- [ ] **src/components/features/dev-tools/seed-data-manager.tsx** - Reference data management

## Phase 3: API Function Updates

### 3.1 Core API Functions

#### Priority: CRITICAL
- [ ] **convex/organisations.ts** - Update CRUD operations for new schema
- [ ] **convex/users.ts** - Update user management with profile structure
- [ ] **convex/lecturers.ts** - Update lecturer operations with profile structure
- [ ] **convex/modules.ts** - Update module operations with profile structure
- [ ] **convex/module_iterations.ts** - Update iteration operations with new relationships
- [ ] **convex/admin_allocations.ts** - Update allocation operations with new categories

### 3.2 New API Functions

#### Priority: HIGH
- [ ] **convex/courses.ts** - Course CRUD operations
- [ ] **convex/cohorts.ts** - Cohort CRUD operations
- [ ] **convex/teams.ts** - Team management with department/faculty relationships
- [ ] **convex/reports.ts** - Reporting and analytics functions
- [ ] **convex/audit.ts** - Audit logging functions
- [ ] **convex/notifications.ts** - Notification system functions

## Phase 4: Frontend Component Updates

### 4.1 Core Component Updates

#### Priority: CRITICAL
- [ ] **src/components/modals/settings-modal.tsx** - Update for new organization structure
- [ ] **src/components/features/lecturer-management/lecturer-management.tsx** - Update for profile structure
- [ ] **src/components/features/module-management/module-management.tsx** - Update for profile structure
- [ ] **src/components/features/module-management/module-iterations.tsx** - Update for new relationships
- [ ] **src/components/features/module-management/module-allocations.tsx** - Update for new structure

### 4.2 New Components

#### Priority: HIGH
- [ ] **src/components/features/course-management/course-management.tsx** - Course management UI
- [ ] **src/components/features/cohort-management/cohort-management.tsx** - Cohort management UI
- [ ] **src/components/features/team-management/team-management.tsx** - Team management UI
- [ ] **src/components/features/reports/workload-reports.tsx** - Workload reporting UI
- [ ] **src/components/features/reports/team-summaries.tsx** - Team summary UI
- [ ] **src/components/features/admin/admin-allocations.tsx** - Admin allocation management
- [ ] **src/components/features/admin/assessment-management.tsx** - Assessment management
- [ ] **src/components/features/admin/site-management.tsx** - Site management
- [ ] **src/components/features/admin/reference-data.tsx** - Reference data management

### 4.3 Form Components

#### Priority: HIGH
- [ ] **src/components/forms/course-form.tsx** - Course creation/editing form
- [ ] **src/components/forms/cohort-form.tsx** - Cohort creation/editing form
- [ ] **src/components/forms/team-form.tsx** - Team creation/editing form
- [ ] **src/components/forms/assessment-form.tsx** - Assessment creation/editing form
- [ ] **src/components/forms/allocation-form.tsx** - Allocation creation/editing form
- [ ] **src/components/forms/site-form.tsx** - Site creation/editing form

### 4.4 Modal Components

#### Priority: MEDIUM
- [ ] **src/components/modals/course-modal.tsx** - Course creation/editing modal
- [ ] **src/components/modals/cohort-modal.tsx** - Cohort creation/editing modal
- [ ] **src/components/modals/team-modal.tsx** - Team creation/editing modal
- [ ] **src/components/modals/assessment-modal.tsx** - Assessment creation/editing modal
- [ ] **src/components/modals/allocation-modal.tsx** - Allocation creation/editing modal
- [ ] **src/components/modals/site-modal.tsx** - Site creation/editing modal
- [ ] **src/components/modals/reference-data-modal.tsx** - Reference data editing modal

## Phase 5: Hook Updates

### 5.1 Core Hooks

#### Priority: CRITICAL
- [ ] **src/hooks/useAcademicYear.ts** - Update for new academic year structure
- [ ] **src/hooks/useStoreUserEffect.ts** - Update for new user structure
- [ ] **src/hooks/user-profile.tsx** - Update for profile structure

### 5.2 New Hooks

#### Priority: HIGH
- [ ] **src/hooks/useCourses.ts** - Course management hook
- [ ] **src/hooks/useCohorts.ts** - Cohort management hook
- [ ] **src/hooks/useTeams.ts** - Team management hook
- [ ] **src/hooks/useReports.ts** - Reporting hook
- [ ] **src/hooks/useAudit.ts** - Audit logging hook
- [ ] **src/hooks/useNotifications.ts** - Notification hook
- [ ] **src/hooks/useReferenceData.ts** - Reference data hook

## Phase 6: Page Updates

### 6.1 New Pages

#### Priority: HIGH
- [ ] **src/app/course-management/page.tsx** - Course management page
- [ ] **src/app/cohort-management/page.tsx** - Cohort management page
- [ ] **src/app/team-management/page.tsx** - Team management page
- [ ] **src/app/reports/page.tsx** - Reports dashboard
- [ ] **src/app/admin/page.tsx** - Admin dashboard
- [ ] **src/app/admin/reference-data/page.tsx** - Reference data management

### 6.2 Updated Pages

#### Priority: CRITICAL
- [ ] **src/app/dashboard/page.tsx** - Update for new data structure
- [ ] **src/app/lecturer-management/page.tsx** - Update for profile structure
- [ ] **src/app/module-management/page.tsx** - Update for profile structure
- [ ] **src/app/module-allocations/page.tsx** - Update for new relationships

## Phase 7: Utility and Library Updates

### 7.1 Core Utilities

#### Priority: HIGH
- [ ] **src/lib/utils.ts** - Update utility functions for new schema
- [ ] **src/lib/academic-workload.ts** - Update workload calculations
- [ ] **src/lib/calculator.ts** - Update calculation functions
- [ ] **src/lib/recentActivity.ts** - Update activity tracking

### 7.2 New Utilities

#### Priority: MEDIUM
- [ ] **src/lib/course-utils.ts** - Course-related utilities
- [ ] **src/lib/cohort-utils.ts** - Cohort-related utilities
- [ ] **src/lib/team-utils.ts** - Team-related utilities
- [ ] **src/lib/report-utils.ts** - Reporting utilities
- [ ] **src/lib/audit-utils.ts** - Audit logging utilities
- [ ] **src/lib/notification-utils.ts** - Notification utilities

## Phase 8: Test Updates

### 8.1 Test Files

#### Priority: HIGH
- [ ] **src/__tests__/api/** - Update all API tests for new schema
- [ ] **src/__tests__/components/** - Update component tests
- [ ] **src/__tests__/hooks/** - Update hook tests
- [ ] **src/__tests__/lib/** - Update utility tests

### 8.2 New Test Files

#### Priority: MEDIUM
- [ ] **src/__tests__/api/courses.test.ts** - Course API tests
- [ ] **src/__tests__/api/cohorts.test.ts** - Cohort API tests
- [ ] **src/__tests__/api/teams.test.ts** - Team API tests
- [ ] **src/__tests__/components/features/course-management.test.tsx** - Course management tests
- [ ] **src/__tests__/components/features/cohort-management.test.tsx** - Cohort management tests
- [ ] **src/__tests__/components/features/team-management.test.tsx** - Team management tests

## Phase 9: Configuration Updates

### 9.1 Configuration Files

#### Priority: MEDIUM
- [ ] **convex/auth.config.ts** - Update authentication rules
- [ ] **src/middleware.ts** - Update middleware for new routes
- [ ] **next.config.mjs** - Update Next.js configuration
- [ ] **tailwind.config.ts** - Update Tailwind for new components

## Phase 10: Documentation Updates

### 10.1 Documentation

#### Priority: MEDIUM
- [ ] **README.md** - Update project documentation
- [ ] **PRD.md** - Update product requirements
- [ ] **API_DOCUMENTATION.md** - Create API documentation
- [ ] **COMPONENT_DOCUMENTATION.md** - Create component documentation

## Implementation Order

### Week 1: Foundation
1. Create core schema files (user_roles, user_profiles, departments, faculties)
2. Update existing schema files (organisations, users, teams)
3. Update Convex schema definition
4. Create migration scripts

### Week 2: Core Entities
1. Create lecturer and module profile structures
2. Update lecturer and module API functions
3. Create course and cohort management
4. Update frontend components for profile structure

### Week 3: Relationships
1. Create course-module-cohort relationships
2. Update module iterations with new structure
3. Create admin allocation categories
4. Update allocation management

### Week 4: Advanced Features
1. Create reporting and analytics
2. Implement audit logging
3. Create notification system
4. Add RBAC system

### Week 5: Testing & Polish
1. Update all tests
2. Fix bugs and edge cases
3. Update documentation
4. Performance optimization

## Risk Mitigation

### Data Migration Risks
- [ ] Create comprehensive backup strategy
- [ ] Test migrations on staging environment
- [ ] Implement rollback procedures
- [ ] Create data validation scripts

### Breaking Changes
- [ ] Maintain backward compatibility where possible
- [ ] Create feature flags for gradual rollout
- [ ] Plan for zero-downtime deployment
- [ ] Create rollback procedures

### Performance Risks
- [ ] Monitor query performance during migration
- [ ] Implement proper indexing strategy
- [ ] Test with realistic data volumes
- [ ] Create performance monitoring

## Success Criteria

### Technical
- [ ] All new tables created and functional
- [ ] Data migration completed successfully
- [ ] All API functions working correctly
- [ ] Frontend components updated and functional
- [ ] Tests passing with new schema
- [ ] Performance maintained or improved

### Functional
- [ ] Academic year scoping working correctly
- [ ] Profile-based structure functioning
- [ ] Course-cohort-module relationships working
- [ ] Reporting and analytics functional
- [ ] Audit logging operational
- [ ] RBAC system implemented

### User Experience
- [ ] No data loss during migration
- [ ] UI remains intuitive and responsive
- [ ] New features enhance user workflow
- [ ] Performance remains acceptable
- [ ] Error handling is robust 