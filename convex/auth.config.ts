/**
 * Convex Authentication Configuration
 * 
 * Configures authentication providers and rules for the WorkloadWizard application.
 * Updated for new profile-based database schema and enhanced security.
 */

export default {
  providers: [
    {
      // Clerk JWT configuration for authentication
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
  // Global authentication rules
  rules: {
    // Default rule: require authentication for all operations
    default: {
      // Users must be authenticated
      auth: true,
      // Users must belong to an organisation
      organisation: true,
    },
    // Specific rules for different table types
    tables: {
      // Core data tables - require authentication and organisation membership
      lecturer_profiles: { auth: true, organisation: true },
      lecturers: { auth: true, organisation: true },
      modules: { auth: true, organisation: true },
      module_iterations: { auth: true, organisation: true },
      module_allocations: { auth: true, organisation: true },
      courses: { auth: true, organisation: true },
      cohorts: { auth: true, organisation: true },
      teams: { auth: true, organisation: true },
      team_summaries: { auth: true, organisation: true },
      
      // Reference data tables - require authentication and organisation membership
      academic_years: { auth: true, organisation: true },
      faculties: { auth: true, organisation: true },
      departments: { auth: true, organisation: true },
      allocation_types: { auth: true, organisation: true },
      assessment_types: { auth: true, organisation: true },
      
      // User and organisation tables - require authentication
      users: { auth: true, organisation: false },
      organisations: { auth: true, organisation: false },
      
      // Audit and notification tables - require authentication and organisation membership
      audit_logs: { auth: true, organisation: true },
      notifications: { auth: true, organisation: true },
      notification_templates: { auth: true, organisation: true },
      notification_settings: { auth: true, organisation: true },
      
      // Report and template tables - require authentication and organisation membership
      report_templates: { auth: true, organisation: true },
      scheduled_reports: { auth: true, organisation: true },
      workload_reports: { auth: true, organisation: true },
      
      // Course and cohort relationship tables
      course_modules: { auth: true, organisation: true },
      cohort_module_plans: { auth: true, organisation: true },
    },
    // Function-specific rules
    functions: {
      // Public functions (no auth required)
      public: {
        // Health check and basic info functions
        health: { auth: false },
        version: { auth: false },
        
        // Public data access (read-only)
        publicData: { auth: false },
      },
      // Authenticated functions (auth required, no organisation)
      authenticated: {
        // User profile management
        userProfile: { auth: true, organisation: false },
        userSettings: { auth: true, organisation: false },
        
        // Organisation management
        organisationManagement: { auth: true, organisation: false },
      },
      // Organisation-scoped functions (auth and organisation required)
      organisation: {
        // Core data management
        lecturerManagement: { auth: true, organisation: true },
        moduleManagement: { auth: true, organisation: true },
        allocationManagement: { auth: true, organisation: true },
        courseManagement: { auth: true, organisation: true },
        cohortManagement: { auth: true, organisation: true },
        teamManagement: { auth: true, organisation: true },
        
        // Reference data management
        referenceDataManagement: { auth: true, organisation: true },
        academicYearManagement: { auth: true, organisation: true },
        
        // Reporting and analytics
        reporting: { auth: true, organisation: true },
        analytics: { auth: true, organisation: true },
        
        // Audit and notifications
        auditLogging: { auth: true, organisation: true },
        notificationManagement: { auth: true, organisation: true },
        
        // Data import/export
        dataImport: { auth: true, organisation: true },
        dataExport: { auth: true, organisation: true },
      },
      // Admin functions (additional permissions required)
      admin: {
        // System administration
        systemAdmin: { auth: true, organisation: true, admin: true },
        userManagement: { auth: true, organisation: true, admin: true },
        organisationAdmin: { auth: true, organisation: true, admin: true },
      },
    },
  },
  // Security settings
  security: {
    // Rate limiting
    rateLimit: {
      enabled: true,
      maxRequests: 1000, // requests per minute
      windowMs: 60000, // 1 minute
    },
    // CORS settings
    cors: {
      enabled: true,
      allowedOrigins: [
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 
          new URL(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).origin : 
          'http://localhost:3000'
      ],
    },
    // Audit logging
    auditLogging: {
      enabled: true,
      logLevel: 'info', // 'debug', 'info', 'warn', 'error'
      includeMetadata: true,
    },
  },
};