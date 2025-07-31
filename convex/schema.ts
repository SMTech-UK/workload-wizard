import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Core Organization Tables
  organisations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    domain: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    settings: v.optional(v.any()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_active", ["isActive"]),

  user_roles: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string()),
    isSystem: v.boolean(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  users: defineTable({
    email: v.string(),
    givenName: v.string(),
    familyName: v.string(),
    name: v.string(),
    pictureUrl: v.optional(v.string()),
    tokenIdentifier: v.string(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    preferences: v.optional(v.any()),
    settings: v.optional(v.any()),
    specialism: v.optional(v.string()),
    subject: v.optional(v.string()),
    systemRole: v.string(),
    team: v.optional(v.string()),
    updatedAt: v.number(),
    username: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_organisation", ["organisationId"])
    .index("by_email", ["email"]),

  user_profiles: defineTable({
    userId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organisation", ["organisationId"]),

  user_settings: defineTable({
    userId: v.string(),
    theme: v.string(),
    language: v.string(),
    timezone: v.string(),
    dateFormat: v.string(),
    timeFormat: v.string(),
    dashboard: v.object({
      defaultView: v.string(),
      showNotifications: v.boolean(),
      showRecentActivity: v.boolean(),
    }),
    notifications: v.object({
      email: v.boolean(),
      inApp: v.boolean(),
      push: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  user_preferences: defineTable({
    userId: v.string(),
    key: v.string(),
    value: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_key", ["userId", "key"]),

  // 2. Academic Structure Tables
  academic_years: defineTable({
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    isActive: v.boolean(),
    isStaging: v.boolean(),
    description: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organisation", ["organisationId"])
    .index("by_active", ["isActive"]),

  semester_periods: defineTable({
    academicYearId: v.id("academic_years"),
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    isActive: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_academic_year", ["academicYearId"]),

  departments: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    facultyId: v.optional(v.id("faculties")),
    organisationId: v.optional(v.id("organisations")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_faculty", ["facultyId"])
    .index("by_organisation", ["organisationId"]),

  faculties: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    organisationId: v.optional(v.id("organisations")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_department", ["departmentId"])
    .index("by_organisation", ["organisationId"]),

  // 3. Staff Management Tables
  lecturer_profiles: defineTable({
    fullName: v.string(),
    email: v.string(),
    team: v.optional(v.string()),
    specialism: v.optional(v.string()),
    contract: v.string(),
    role: v.optional(v.string()),
    family: v.optional(v.string()),
    fte: v.number(),
    capacity: v.number(),
    maxTeachingHours: v.number(),
    totalContract: v.number(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_organisation", ["organisationId"]),

  lecturer_statuses: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  lecturers: defineTable({
    profileId: v.id("lecturer_profiles"),
    academicYearId: v.id("academic_years"),
    status: v.string(),
    teachingAvailability: v.number(),
    totalAllocated: v.number(),
    allocatedTeachingHours: v.number(),
    allocatedAdminHours: v.number(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_profile", ["profileId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  admin_allocation_categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    defaultHours: v.optional(v.number()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  admin_allocations: defineTable({
    lecturerId: v.id("lecturers"),
    academicYearId: v.id("academic_years"),
    categoryId: v.optional(v.id("admin_allocation_categories")),
    title: v.string(),
    description: v.optional(v.string()),
    hours: v.number(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
    recurrencePattern: v.optional(v.string()),
    status: v.string(),
    isActive: v.boolean(),
    isApproved: v.optional(v.boolean()),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    priority: v.string(),
    isEssential: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_lecturer", ["lecturerId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_category", ["categoryId"])
    .index("by_organisation", ["organisationId"]),

  // 4. Course & Module Tables
  courses: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    credits: v.number(),
    level: v.number(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  cohorts: defineTable({
    name: v.string(),
    code: v.string(),
    courseId: v.id("courses"),
    startDate: v.string(),
    endDate: v.string(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_organisation", ["organisationId"]),

  modules: defineTable({
    code: v.string(),
    title: v.string(),
    credits: v.number(),
    level: v.number(),
    moduleLeader: v.string(),
    defaultTeachingHours: v.number(),
    defaultMarkingHours: v.number(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  course_modules: defineTable({
    courseId: v.id("courses"),
    moduleId: v.id("modules"),
    isCore: v.boolean(),
    isOptional: v.boolean(),
    order: v.optional(v.number()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_module", ["moduleId"])
    .index("by_organisation", ["organisationId"]),

  cohort_module_plans: defineTable({
    cohortId: v.id("cohorts"),
    moduleId: v.id("modules"),
    academicYearId: v.id("academic_years"),
    semester: v.number(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_cohort", ["cohortId"])
    .index("by_module", ["moduleId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  // 5. Module Delivery Tables
  module_iterations: defineTable({
    moduleId: v.id("modules"),
    academicYearId: v.id("academic_years"),
    semester: v.number(),
    title: v.string(),
    moduleCode: v.string(),
    assignedLecturerId: v.optional(v.string()),
    assignedLecturerIds: v.array(v.id("lecturers")),
    assignedStatus: v.string(),
    cohortId: v.optional(v.string()),
    teachingHours: v.number(),
    markingHours: v.number(),
    teachingStartDate: v.string(),
    notes: v.optional(v.string()),
    assessments: v.array(v.object({
      title: v.string(),
      type: v.string(),
      weighting: v.number(),
      submissionDate: v.string(),
      marksDueDate: v.string(),
      isSecondAttempt: v.boolean(),
      externalExaminerRequired: v.boolean(),
      alertsToTeam: v.boolean(),
    })),
    sites: v.array(v.object({
      name: v.string(),
      students: v.number(),
      groups: v.number(),
      deliveryTime: v.string(),
    })),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_module", ["moduleId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  module_iteration_groups: defineTable({
    moduleIterationId: v.id("module_iterations"),
    name: v.string(),
    size: v.number(),
    lecturerId: v.optional(v.id("lecturers")),
    siteId: v.optional(v.id("sites")),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_module_iteration", ["moduleIterationId"])
    .index("by_lecturer", ["lecturerId"])
    .index("by_organisation", ["organisationId"]),

  sites: defineTable({
    name: v.string(),
    code: v.string(),
    address: v.optional(v.string()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  assessment_types: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    defaultWeighting: v.optional(v.number()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  module_iteration_assessments: defineTable({
    moduleIterationId: v.id("module_iterations"),
    assessmentTypeId: v.optional(v.id("assessment_types")),
    title: v.string(),
    type: v.string(),
    weighting: v.number(),
    submissionDate: v.string(),
    marksDueDate: v.string(),
    isSecondAttempt: v.boolean(),
    externalExaminerRequired: v.boolean(),
    alertsToTeam: v.boolean(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_module_iteration", ["moduleIterationId"])
    .index("by_assessment_type", ["assessmentTypeId"])
    .index("by_organisation", ["organisationId"]),

  allocation_types: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    defaultHours: v.optional(v.number()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  module_allocations: defineTable({
    moduleIterationId: v.id("module_iterations"),
    lecturerId: v.id("lecturers"),
    allocationTypeId: v.optional(v.id("allocation_types")),
    hours: v.number(),
    groupNumber: v.optional(v.number()),
    semester: v.optional(v.string()),
    siteName: v.optional(v.string()),
    type: v.optional(v.string()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_module_iteration", ["moduleIterationId"])
    .index("by_lecturer", ["lecturerId"])
    .index("by_allocation_type", ["allocationTypeId"])
    .index("by_organisation", ["organisationId"]),

  // 6. Reporting & Analytics Tables
  team_summaries: defineTable({
    teamId: v.id("teams"),
    academicYearId: v.id("academic_years"),
    totalLecturers: v.number(),
    totalModules: v.number(),
    totalTeachingHours: v.number(),
    totalAdminHours: v.number(),
    averageUtilization: v.number(),
    lastCalculatedAt: v.number(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  workload_reports: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    academicYearId: v.id("academic_years"),
    reportType: v.string(),
    data: v.any(),
    generatedBy: v.string(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  workload_calculation_rules: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    formula: v.string(),
    variables: v.array(v.string()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  // 7. System Tables
  organisation_settings: defineTable({
    organisationId: v.id("organisations"),
    key: v.string(),
    value: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organisation", ["organisationId"])
    .index("by_organisation_key", ["organisationId", "key"]),

  notification_settings: defineTable({
    userId: v.string(),
    type: v.string(),
    email: v.boolean(),
    inApp: v.boolean(),
    push: v.boolean(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organisation", ["organisationId"]),

  external_systems: defineTable({
    name: v.string(),
    type: v.string(),
    config: v.any(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  data_sync_logs: defineTable({
    externalSystemId: v.optional(v.id("external_systems")),
    operation: v.string(),
    status: v.string(),
    details: v.optional(v.any()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
  })
    .index("by_external_system", ["externalSystemId"])
    .index("by_organisation", ["organisationId"]),

  report_templates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    template: v.any(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  scheduled_reports: defineTable({
    templateId: v.id("report_templates"),
    schedule: v.string(),
    recipients: v.array(v.string()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_template", ["templateId"])
    .index("by_organisation", ["organisationId"]),

  user_sessions: defineTable({
    userId: v.string(),
    sessionId: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    expiresAt: v.number(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_organisation", ["organisationId"]),

  audit_logs: defineTable({
    userId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_organisation", ["organisationId"]),

  data_migrations: defineTable({
    name: v.string(),
    version: v.string(),
    appliedAt: v.number(),
    duration: v.number(),
    status: v.string(),
    details: v.any(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  roles: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string()),
    isSystem: v.boolean(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  user_role_assignments: defineTable({
    userId: v.string(),
    roleId: v.id("roles"),
    assignedBy: v.string(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["roleId"])
    .index("by_organisation", ["organisationId"]),

  events: defineTable({
    type: v.string(),
    data: v.any(),
    userId: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_user", ["userId"])
    .index("by_organisation", ["organisationId"]),

  file_attachments: defineTable({
    filename: v.string(),
    originalName: v.string(),
    mimeType: v.string(),
    size: v.number(),
    url: v.string(),
    uploadedBy: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_organisation", ["organisationId"]),

  tags: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),

  taggables: defineTable({
    tagId: v.id("tags"),
    entityType: v.string(),
    entityId: v.string(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
  })
    .index("by_tag", ["tagId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_organisation", ["organisationId"]),
}); 