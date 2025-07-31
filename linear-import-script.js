import { LinearClient } from '@linear/sdk';

const linear = new LinearClient({ apiKey: 'lin_api_Zygi3kOYaIkxaVa8jYyglrhWols5e3q0Ro60D9QF' });

// Helper function to determine labels based on issue properties and context
function getUpdatedLabels(issue, isSubtask = false) {
  let labels = new Set(issue.labels || []);

  // Add Priority labels based on numerical priority
  if (issue.priority === 2 || issue.priority === 1) { // Critical or High
    labels.add("Priority: High +");
  } else if (issue.priority === 0) { // Medium or Low
    labels.add("Priority: Low -");
  }

  // Add Dependencies label based on existing labels or context
  if (
    labels.has("data-migration") ||
    labels.has("integrations") ||
    labels.has("convex-schema") ||
    labels.has("convex-api") ||
    labels.has("data-flow")
  ) {
    labels.add("dependencies");
  }

  // Add Scope labels based on existing labels or context
  // Scope: Backend
  if (
    labels.has("convex-schema") ||
    labels.has("convex-api") ||
    labels.has("data-flow") ||
    labels.has("staff-management") ||
    labels.has("course-module") ||
    labels.has("workload") ||
    labels.has("reporting") ||
    labels.has("user-management") ||
    labels.has("settings") ||
    labels.has("audit") ||
    labels.has("notifications") ||
    labels.has("attachments") ||
    labels.has("data-migration") ||
    labels.has("performance") ||
    labels.has("security") ||
    labels.has("error-handling") ||
    labels.has("integrations") ||
    labels.has("refactoring")
  ) {
    labels.add("Scope: Backend");
  }

  // Scope: Database (often overlaps with Backend, but explicit for DB-focused tasks)
  if (
    labels.has("convex-schema") ||
    labels.has("data-migration") ||
    labels.has("performance")
  ) {
    labels.add("Scope: Database");
  }

  // Scope: Frontend
  if (
    labels.has("ui-ux") ||
    labels.has("data-flow") ||
    labels.has("staff-management") ||
    labels.has("course-module") ||
    labels.has("workload") ||
    labels.has("reporting") ||
    labels.has("user-management") ||
    labels.has("settings") ||
    labels.has("notifications") ||
    labels.has("attachments") ||
    labels.has("performance") ||
    labels.has("security") ||
    labels.has("error-handling") ||
    labels.has("refactoring")
  ) {
    labels.add("Scope: Frontend");
  }

  // Scope: DevOps
  if (
    labels.has("testing") ||
    labels.has("documentation") ||
    labels.has("security") ||
    labels.has("launch")
  ) {
    labels.add("Scope: DevOps");
  }

  return Array.from(labels);
}

const allIssues = [
  {
    title: "Create New Convex Schema Files",
    description: "Create 32 new schema files for the normalized database structure - Priority: CRITICAL - Phase 1.1",
    priority: 2, // Critical
    labels: ["phase-1", "convex-schema", "critical"],
    estimate: 16,
    teamId: "SMT",
    subtasks: [
      { title: "Create convex/user_roles.ts", description: "User role definitions and API", estimate: 2 },
      { title: "Create convex/user_profiles.ts", description: "User profile management", estimate: 3 },
      { title: "Create convex/user_settings.ts", description: "User settings management", estimate: 2 },
      { title: "Create convex/user_preferences.ts", description: "User preferences (key-value)", estimate: 1 },
      { title: "Create convex/departments.ts", description: "Department structure", estimate: 2 },
      { title: "Create convex/faculties.ts", description: "Faculty structure", estimate: 2 },
      { title: "Create convex/semester_periods.ts", description: "Semester date management", estimate: 2 },
      { title: "Create convex/sites.ts", description: "Physical location management", estimate: 2 },
      { title: "Create convex/assessment_types.ts", description: "Assessment type definitions", estimate: 1 },
      { title: "Create convex/allocation_types.ts", description: "Allocation type definitions", estimate: 1 },
      { title: "Create convex/courses.ts", description: "Course management", estimate: 3 },
      { title: "Create convex/cohorts.ts", description: "Cohort management", estimate: 2 },
      { title: "Create convex/course_modules.ts", description: "Course-module relationships", estimate: 2 },
      { title: "Create convex/cohort_module_plans.ts", description: "Cohort-specific module delivery", estimate: 2 },
      { title: "Create convex/module_iteration_groups.ts", description: "Module iteration groups", estimate: 2 },
      { title: "Create convex/module_iteration_assessments.ts", description: "Module assessments", estimate: 2 },
      { title: "Create convex/team_summaries.ts", description: "Team metrics calculation", estimate: 3 },
      { title: "Create convex/workload_reports.ts", description: "Workload reporting", estimate: 3 },
      { title: "Create convex/workload_calculation_rules.ts", description: "Custom calculation rules", estimate: 2 },
      { title: "Create convex/organisation_settings.ts", description: "Organization configuration", estimate: 2 },
      { title: "Create convex/notification_settings.ts", description: "Notification preferences", estimate: 2 },
      { title: "Create convex/external_systems.ts", description: "External system integrations", estimate: 2 },
      { title: "Create convex/data_sync_logs.ts", description: "Sync operation tracking", estimate: 2 },
      { title: "Create convex/report_templates.ts", description: "Report template management", estimate: 2 },
      { title: "Create convex/scheduled_reports.ts", description: "Automated report scheduling", estimate: 2 },
      { title: "Create convex/user_sessions.ts", description: "Session management", estimate: 1 },
      { title: "Create convex/audit_logs.ts", description: "Audit trail system", estimate: 3 },
      { title: "Create convex/data_migrations.ts", description: "Migration tracking", estimate: 2 },
      { title: "Create convex/roles.ts", description: "RBAC role definitions", estimate: 2 },
      { title: "Create convex/user_role_assignments.ts", description: "User-role relationships", estimate: 2 },
      { title: "Create convex/events.ts", description: "Domain event tracking", estimate: 2 },
      { title: "Create convex/file_attachments.ts", description: "File storage system", estimate: 2 },
      { title: "Create convex/tags.ts", description: "Tagging system", estimate: 1 },
      { title: "Create convex/taggables.ts", description: "Tag associations", estimate: 1 }
    ]
  },
  {
    title: "Update Existing Schema Files",
    description: "Update 7 existing schema files for new structure - Priority: CRITICAL - Phase 1.2",
    priority: 2,
    labels: ["phase-1", "convex-schema", "critical"],
    estimate: 12,
    teamId: "SMT",
    subtasks: [
      { title: "Update convex/organisations.ts", description: "Remove JSON fields, add new columns", estimate: 4 },
      { title: "Update convex/users.ts", description: "Split into core + profile structure", estimate: 5 },
      { title: "Update convex/teams.ts", description: "Add department/faculty relationships", estimate: 3 },
      { title: "Update convex/lecturers.ts", description: "Update to use profile structure", estimate: 6 },
      { title: "Update convex/modules.ts", description: "Update to use profile structure", estimate: 6 },
      { title: "Update convex/module_iterations.ts", description: "Update relationships and structure", estimate: 4 },
      { title: "Update convex/admin_allocations.ts", description: "Update to use new categories", estimate: 3 }
    ]
  },
  {
    title: "Update Convex Schema Definition",
    description: "Update schema definition and authentication rules - Priority: CRITICAL - Phase 1.3",
    priority: 2,
    labels: ["phase-1", "convex-schema", "critical"],
    estimate: 5,
    teamId: "SMT",
    subtasks: [
      { title: "Update convex/schema.ts", description: "Add all new table definitions", estimate: 2 },
      { title: "Update convex/auth.config.ts", description: "Update authentication rules for new tables", estimate: 3 },
      { title: "Regenerate convex/_generated/", description: "API types after schema changes", estimate: 1 }
    ]
  },
  {
    title: "Data Migration Implementation",
    description: "Implement data migration scripts and UI - Priority: HIGH - Phase 2",
    priority: 1, // High
    labels: ["phase-2", "data-migration", "high"],
    estimate: 18,
    teamId: "SMT",
    subtasks: [
      { title: "Update convex/migrations.ts", description: "Update existing migration functions", estimate: 4 },
      { title: "Create convex/migrations/profile-migration.ts", description: "Profile structure migration", estimate: 8 },
      { title: "Create convex/migrations/academic-year-migration.ts", description: "Academic year assignment", estimate: 6 },
      { title: "Create convex/migrations/data-normalization.ts", description: "JSON field normalization", estimate: 4 },
      { title: "Create convex/migrations/seed-data.ts", description: "Seed reference data (roles, types, etc.)", estimate: 3 },
      { title: "Update data-migration.tsx", description: "Update migration UI", estimate: 3 },
      { title: "Create migration-status.tsx", description: "Migration progress tracking", estimate: 2 },
      { title: "Create seed-data-manager.tsx", description: "Reference data management", estimate: 2 }
    ]
  },
  {
    title: "Update Core API Functions",
    description: "Update 6 core API functions for new schema - Priority: CRITICAL - Phase 3.1",
    priority: 2,
    labels: ["phase-3", "convex-api", "critical"],
    estimate: 28,
    teamId: "SMT",
    subtasks: [
      { title: "Update convex/organisations.ts API", description: "Update CRUD operations for new schema", estimate: 4 },
      { title: "Update convex/users.ts API", description: "Update user management with profile structure", estimate: 5 },
      { title: "Update convex/lecturers.ts API", description: "Update lecturer operations with profile structure", estimate: 6 },
      { title: "Update convex/modules.ts API", description: "Update module operations with profile structure", estimate: 6 },
      { title: "Update convex/module_iterations.ts API", description: "Update iteration operations with new relationships", estimate: 4 },
      { title: "Update convex/admin_allocations.ts API", description: "Update allocation operations with new categories", estimate: 3 }
    ]
  },
  {
    title: "Create New API Functions",
    description: "Create 6 new API functions for advanced features - Priority: HIGH - Phase 3.2",
    priority: 1,
    labels: ["phase-3", "convex-api", "high"],
    estimate: 20,
    teamId: "SMT",
    subtasks: [
      { title: "Create convex/courses.ts", description: "Course CRUD operations", estimate: 5 },
      { title: "Create convex/cohorts.ts", description: "Cohort CRUD operations", estimate: 4 },
      { title: "Create convex/teams.ts", description: "Team management with department/faculty relationships", estimate: 4 },
      { title: "Create convex/reports.ts", description: "Reporting and analytics functions", estimate: 4 },
      { title: "Create convex/audit.ts", description: "Audit logging functions", estimate: 3 },
      { title: "Create convex/notifications.ts", description: "Notification system functions", estimate: 3 }
    ]
  },
  {
    title: "Update Core Frontend Components",
    description: "Update 5 core frontend components for new structure - Priority: CRITICAL - Phase 4.1",
    priority: 2,
    labels: ["phase-4", "ui-ux", "critical"],
    estimate: 34,
    teamId: "SMT",
    subtasks: [
      { title: "Update settings-modal.tsx", description: "Update for new organization structure", estimate: 6 },
      { title: "Update lecturer-management.tsx", description: "Update for profile structure", estimate: 8 },
      { title: "Update module-management.tsx", description: "Update for profile structure", estimate: 8 },
      { title: "Update module-iterations.tsx", description: "Update for new relationships", estimate: 6 },
      { title: "Update module-allocations.tsx", description: "Update for new structure", estimate: 6 }
    ]
  },
  {
    title: "Create New Frontend Components",
    description: "Create 9 new frontend components for advanced features - Priority: HIGH - Phase 4.2",
    priority: 1,
    labels: ["phase-4", "ui-ux", "high"],
    estimate: 45,
    teamId: "SMT",
    subtasks: [
      { title: "Create course-management.tsx", description: "Course management UI", estimate: 8 },
      { title: "Create cohort-management.tsx", description: "Cohort management UI", estimate: 6 },
      { title: "Create team-management.tsx", description: "Team management UI", estimate: 5 },
      { title: "Create workload-reports.tsx", description: "Workload reporting UI", estimate: 6 },
      { title: "Create team-summaries.tsx", description: "Team summary UI", estimate: 4 },
      { title: "Create admin-allocations.tsx", description: "Admin allocation management", estimate: 4 },
      { title: "Create assessment-management.tsx", description: "Assessment management", estimate: 4 },
      { title: "Create site-management.tsx", description: "Site management", estimate: 4 },
      { title: "Create reference-data.tsx", description: "Reference data management", estimate: 4 }
    ]
  },
  {
    title: "Create Form Components",
    description: "Create 6 form components for data entry - Priority: HIGH - Phase 4.3",
    priority: 1,
    labels: ["phase-4", "ui-ux", "high"],
    estimate: 24,
    teamId: "SMT",
    subtasks: [
      { title: "Create course-form.tsx", description: "Course creation/editing form", estimate: 4 },
      { title: "Create cohort-form.tsx", description: "Cohort creation/editing form", estimate: 4 },
      { title: "Create team-form.tsx", description: "Team creation/editing form", estimate: 4 },
      { title: "Create assessment-form.tsx", description: "Assessment creation/editing form", estimate: 4 },
      { title: "Create allocation-form.tsx", description: "Allocation creation/editing form", estimate: 4 },
      { title: "Create site-form.tsx", description: "Site creation/editing form", estimate: 4 }
    ]
  },
  {
    title: "Create Modal Components",
    description: "Create 7 modal components for data editing - Priority: MEDIUM - Phase 4.4",
    priority: 0, // Medium
    labels: ["phase-4", "ui-ux", "medium"],
    estimate: 21,
    teamId: "SMT",
    subtasks: [
      { title: "Create course-modal.tsx", description: "Course creation/editing modal", estimate: 3 },
      { title: "Create cohort-modal.tsx", description: "Cohort creation/editing modal", estimate: 3 },
      { title: "Create team-modal.tsx", description: "Team creation/editing modal", estimate: 3 },
      { title: "Create assessment-modal.tsx", description: "Assessment creation/editing modal", estimate: 3 },
      { title: "Create allocation-modal.tsx", description: "Allocation creation/editing modal", estimate: 3 },
      { title: "Create site-modal.tsx", description: "Site creation/editing modal", estimate: 3 },
      { title: "Create reference-data-modal.tsx", description: "Reference data editing modal", estimate: 3 }
    ]
  },
  {
    title: "Update Core Hooks",
    description: "Update 3 core hooks for new structure - Priority: CRITICAL - Phase 5.1",
    priority: 2,
    labels: ["phase-5", "data-flow", "critical"],
    estimate: 7,
    teamId: "SMT",
    subtasks: [
      { title: "Update useAcademicYear.ts", description: "Update for new academic year structure", estimate: 3 },
      { title: "Update useStoreUserEffect.ts", description: "Update for new user structure", estimate: 2 },
      { title: "Update user-profile.tsx", description: "Update for profile structure", estimate: 2 }
    ]
  },
  {
    title: "Create New Hooks",
    description: "Create 7 new hooks for advanced features - Priority: HIGH - Phase 5.2",
    priority: 1,
    labels: ["phase-5", "data-flow", "high"],
    estimate: 14,
    teamId: "SMT",
    subtasks: [
      { title: "Create useCourses.ts", description: "Course management hook", estimate: 3 },
      { title: "Create useCohorts.ts", description: "Cohort management hook", estimate: 2 },
      { title: "Create useTeams.ts", description: "Team management hook", estimate: 2 },
      { title: "Create useReports.ts", description: "Reporting hook", estimate: 2 },
      { title: "Create useAudit.ts", description: "Audit logging hook", estimate: 2 },
      { title: "Create useNotifications.ts", description: "Notification hook", estimate: 2 },
      { title: "Create useReferenceData.ts", description: "Reference data hook", estimate: 1 }
    ]
  },
  {
    title: "Create New Pages",
    description: "Create 6 new pages for advanced features - Priority: HIGH - Phase 6.1",
    priority: 1,
    labels: ["phase-6", "ui-ux", "high"],
    estimate: 18,
    teamId: "SMT",
    subtasks: [
      { title: "Create course-management page", description: "Course management page", estimate: 4 },
      { title: "Create cohort-management page", description: "Cohort management page", estimate: 3 },
      { title: "Create team-management page", description: "Team management page", estimate: 3 },
      { title: "Create reports page", description: "Reports dashboard", estimate: 3 },
      { title: "Create admin page", description: "Admin dashboard", estimate: 3 },
      { title: "Create reference-data page", description: "Reference data management", estimate: 2 }
    ]
  },
  {
    title: "Update Existing Pages",
    description: "Update 4 existing pages for new structure - Priority: CRITICAL - Phase 6.2",
    priority: 2,
    labels: ["phase-6", "ui-ux", "critical"],
    estimate: 20,
    teamId: "SMT",
    subtasks: [
      { title: "Update dashboard page", description: "Update for new data structure", estimate: 5 },
      { title: "Update lecturer-management page", description: "Update for profile structure", estimate: 6 },
      { title: "Update module-management page", description: "Update for profile structure", estimate: 6 },
      { title: "Update module-allocations page", description: "Update for new relationships", estimate: 3 }
    ]
  },
  {
    title: "Update Core Utilities",
    description: "Update 4 core utility functions for new schema - Priority: HIGH - Phase 7.1",
    priority: 1,
    labels: ["phase-7", "refactoring", "high"],
    estimate: 7,
    teamId: "SMT",
    subtasks: [
      { title: "Update utils.ts", description: "Update utility functions for new schema", estimate: 3 },
      { title: "Update academic-workload.ts", description: "Update workload calculations", estimate: 4 },
      { title: "Update calculator.ts", description: "Update calculation functions", estimate: 2 },
      { title: "Update recentActivity.ts", description: "Update activity tracking", estimate: 2 }
    ]
  },
  {
    title: "Create New Utilities",
    description: "Create 6 new utility functions for advanced features - Priority: MEDIUM - Phase 7.2",
    priority: 0,
    labels: ["phase-7", "refactoring", "medium"],
    estimate: 12,
    teamId: "SMT",
    subtasks: [
      { title: "Create course-utils.ts", description: "Course-related utilities", estimate: 2 },
      { title: "Create cohort-utils.ts", description: "Cohort-related utilities", estimate: 2 },
      { title: "Create team-utils.ts", description: "Team-related utilities", estimate: 2 },
      { title: "Create report-utils.ts", description: "Reporting utilities", estimate: 2 },
      { title: "Create audit-utils.ts", description: "Audit logging utilities", estimate: 2 },
      { title: "Create notification-utils.ts", description: "Notification utilities", estimate: 2 }
    ]
  },
  {
    title: "Update Tests",
    description: "Update 4 test categories for new schema - Priority: HIGH - Phase 8.1",
    priority: 1,
    labels: ["phase-8", "testing", "high"],
    estimate: 14,
    teamId: "SMT",
    subtasks: [
      { title: "Update API tests", description: "Update all API tests for new schema", estimate: 8 },
      { title: "Update component tests", description: "Update component tests", estimate: 6 },
      { title: "Update hook tests", description: "Update hook tests", estimate: 3 },
      { title: "Update utility tests", description: "Update utility tests", estimate: 2 }
    ]
  },
  {
    title: "Create New Tests",
    description: "Create 6 new test files for advanced features - Priority: MEDIUM - Phase 8.2",
    priority: 0,
    labels: ["phase-8", "testing", "medium"],
    estimate: 8,
    teamId: "SMT",
    subtasks: [
      { title: "Create courses.test.ts", description: "Course API tests", estimate: 3 },
      { title: "Create cohorts.test.ts", description: "Cohort API tests", estimate: 2 },
      { title: "Create teams.test.ts", description: "Team API tests", estimate: 2 },
      { title: "Create course-management.test.tsx", description: "Course management tests", estimate: 2 },
      { title: "Create cohort-management.test.tsx", description: "Cohort management tests", estimate: 2 },
      { title: "Create team-management.test.tsx", description: "Team management tests", estimate: 2 }
    ]
  },
  {
    title: "Update Configuration",
    description: "Update 4 configuration files for new structure - Priority: MEDIUM - Phase 9.1",
    priority: 0,
    labels: ["phase-9", "refactoring", "medium"],
    estimate: 3,
    teamId: "SMT",
    subtasks: [
      { title: "Update auth.config.ts", description: "Update authentication rules", estimate: 2 },
      { title: "Update middleware.ts", description: "Update middleware for new routes", estimate: 1 },
      { title: "Update next.config.mjs", description: "Update Next.js configuration", estimate: 1 },
      { title: "Update tailwind.config.ts", description: "Update Tailwind for new components", estimate: 1 }
    ]
  },
  {
    title: "Update Documentation",
    description: "Update 4 documentation files for new structure - Priority: MEDIUM - Phase 10.1",
    priority: 0,
    labels: ["phase-10", "documentation", "medium"],
    estimate: 6,
    teamId: "SMT",
    subtasks: [
      { title: "Update README.md", description: "Update project documentation", estimate: 2 },
      { title: "Update PRD.md", description: "Update product requirements", estimate: 2 },
      { title: "Create API_DOCUMENTATION.md", description: "Create API documentation", estimate: 4 },
      { title: "Create COMPONENT_DOCUMENTATION.md", description: "Create component documentation", estimate: 3 }
    ]
  },
  {
    title: "Data Migration & Testing",
    description: "Implement comprehensive data migration and testing strategy - Priority: CRITICAL",
    priority: 2,
    labels: ["data-migration", "testing", "critical"],
    estimate: 15,
    teamId: "SMT",
    subtasks: [
      { title: "Create comprehensive backup strategy", description: "Backup all existing data before migration", estimate: 2 },
      { title: "Test migrations on staging environment", description: "Validate all migrations work correctly", estimate: 4 },
      { title: "Implement rollback procedures", description: "Create rollback scripts for failed migrations", estimate: 3 },
      { title: "Create data validation scripts", description: "Validate data integrity after migration", estimate: 2 },
      { title: "Monitor query performance during migration", description: "Track performance impact of new schema", estimate: 2 },
      { title: "Test with realistic data volumes", description: "Test with production-like data volumes", estimate: 2 }
    ]
  },
  {
    title: "Performance & Security",
    description: "Implement performance optimizations and security measures - Priority: HIGH",
    priority: 1,
    labels: ["performance", "security", "high"],
    estimate: 10,
    teamId: "SMT",
    subtasks: [
      { title: "Implement proper indexing strategy", description: "Add indexes for optimal query performance", estimate: 3 },
      { title: "Create performance monitoring", description: "Set up monitoring for query performance", estimate: 2 },
      { title: "Implement proper access control for all functions", description: "Add organization-scoped access control", estimate: 3 },
      { title: "Validate organization access in all queries", description: "Ensure multi-tenancy isolation", estimate: 2 },
      { title: "Test multi-tenancy isolation", description: "Verify organizations cannot access other data", estimate: 2 }
    ]
  },
  {
    title: "Final Testing & Polish",
    description: "Final testing, bug fixes, and performance optimization - Priority: HIGH",
    priority: 1,
    labels: ["testing", "refactoring", "high"],
    estimate: 12,
    teamId: "SMT",
    subtasks: [
      { title: "Fix bugs and edge cases", description: "Address all identified issues", estimate: 4 },
      { title: "Performance optimization", description: "Optimize slow queries and components", estimate: 3 },
      { title: "Update error handling", description: "Improve error messages and handling", estimate: 2 },
      { title: "Test user workflows", description: "End-to-end testing of all user journeys", estimate: 2 },
      { title: "Validate data integrity", description: "Ensure all data relationships are correct", estimate: 2 },
      { title: "Final documentation review", description: "Review and update all documentation", estimate: 1 }
    ]
  }
];

// Apply the label updates to all issues and subtasks
allIssues.forEach(parentIssue => {
  parentIssue.labels = getUpdatedLabels(parentIssue);
  if (parentIssue.subtasks) {
    parentIssue.subtasks.forEach(subtask => {
      // Subtasks inherit priority from parent for label determination
      // If subtask has its own labels, use them, otherwise inherit from parent
      const subtaskLabels = new Set(subtask.labels || []);
      const tempSubtask = {
        ...subtask,
        priority: parentIssue.priority, // Use parent's priority for label logic
        labels: Array.from(subtaskLabels) // Pass existing labels
      };
      subtask.labels = getUpdatedLabels(tempSubtask, true);
    });
  }
});

async function importAllIssues() {
  console.log('🚀 Starting Linear import...');
  console.log(`📊 Total parent issues: ${allIssues.length}`);
  console.log(`📋 Total subtasks: ${allIssues.reduce((sum, issue) => sum + issue.subtasks.length, 0)}`);
  console.log('');
  
  // First, get the actual team ID
  console.log('🔍 Fetching team information...');
  const teams = await linear.teams();
  const team = teams.nodes.find(t => t.key === 'SMT' || t.name === 'SMT');
  
  if (!team) {
    console.error('❌ Could not find team with key or name "SMT"');
    console.log('Available teams:');
    teams.nodes.forEach(t => console.log(`  - ${t.name} (${t.key}) - ID: ${t.id}`));
    return;
  }
  
  console.log(`✅ Found team: ${team.name} (${team.key}) - ID: ${team.id}`);
  console.log('');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [index, parentIssue] of allIssues.entries()) {
    try {
      console.log(`📝 Creating parent ${index + 1}/${allIssues.length}: ${parentIssue.title}`);
      
      // Create parent issue
      const parent = await linear.createIssue({
        title: parentIssue.title,
        description: parentIssue.description,
        priority: parentIssue.priority,
        teamId: team.id,
        labelIds: await getLabelIds(parentIssue.labels),
        estimate: parentIssue.estimate
      });
      
      console.log(`✅ Created parent: ${parentIssue.title} (ID: ${parent.id})`);
      
      // Create subtasks
      for (const [subIndex, subtask] of parentIssue.subtasks.entries()) {
        try {
          await linear.createIssue({
            title: subtask.title,
            description: subtask.description,
            priority: parentIssue.priority,
            teamId: team.id,
            labelIds: await getLabelIds(parentIssue.labels),
            estimate: subtask.estimate,
            parentId: parent.id
          });
          
          console.log(`  ✅ Created subtask ${subIndex + 1}/${parentIssue.subtasks.length}: ${subtask.title}`);
        } catch (subtaskError) {
          console.error(`  ❌ Failed to create subtask: ${subtask.title}`, subtaskError);
          errorCount++;
        }
      }
      
      successCount++;
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Failed to create parent: ${parentIssue.title}`, error);
      errorCount++;
    }
    
    console.log('');
  }
  
  console.log('🎉 Import complete!');
  console.log(`✅ Successful: ${successCount}/${allIssues.length} parent issues`);
  console.log(`❌ Errors: ${errorCount} issues failed`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Review all created issues in Linear');
  console.log('2. Assign team members to issues');
  console.log('3. Set up project milestones');
  console.log('4. Configure workflows and labels');
}

// Helper to get Linear Label IDs from names
async function getLabelIds(labelNames) {
  if (!labelNames || labelNames.length === 0) {
    return [];
  }
  
  try {
    const labels = await linear.issueLabels();
    const labelMap = new Map(labels.nodes.map(label => [label.name, label.id]));
    return labelNames.map(name => labelMap.get(name)).filter(Boolean);
  } catch (error) {
    console.warn(`⚠️ Could not fetch labels: ${error.message}`);
    return [];
  }
}

// Run the import
importAllIssues().catch(console.error); 