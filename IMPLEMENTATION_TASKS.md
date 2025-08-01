# WorkloadWizard Database Implementation Tasks

## Phase 4: Frontend Component Updates

### 4.1 Core Component Updates

#### Priority: CRITICAL
- [x] **src/components/modals/settings-modal.tsx** - Update for new organization structure
- [x] **src/components/features/lecturer-management/lecturer-management.tsx** - Update for profile structure
- [x] **src/components/features/module-management/module-management.tsx** - Update for profile structure
- [x] **src/components/features/module-management/module-iterations.tsx** - Update for new relationships
- [x] **src/components/features/module-management/module-allocations.tsx** - Update for new structure

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