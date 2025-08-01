import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Core Organization Tables
  organisations: defineTable({
    name: v.string(),
    code: v.optional(v.string()),
    domain: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      postalCode: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
    standardClassSize: v.optional(v.number()),
    defaultTeachingHours: v.optional(v.number()),
    defaultMarkingHours: v.optional(v.number()),
    defaultAdminHours: v.optional(v.number()),
    currentAcademicYearId: v.optional(v.id("academic_years")),
    currentSemesterPeriodId: v.optional(v.id("semester_periods")),
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
    currency: v.optional(v.string()),
    enableModuleAllocations: v.optional(v.boolean()),
    enableWorkloadTracking: v.optional(v.boolean()),
    enableNotifications: v.optional(v.boolean()),
    requireAdminApproval: v.optional(v.boolean()),
    enableAuditTrail: v.optional(v.boolean()),
    enableAdvancedReporting: v.optional(v.boolean()),
    isActive: v.boolean(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
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
    subject: v.string(),
    name: v.string(),
    givenName: v.string(),
    familyName: v.string(),
    username: v.string(),
    pictureUrl: v.optional(v.string()),
    email: v.string(),
    tokenIdentifier: v.string(),
    systemRole: v.string(),
    organisationId: v.optional(v.id("organisations")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_organisation", ["organisationId"])
    .index("by_email", ["email"])
    .index("by_subject", ["subject"]),

  user_profiles: defineTable({
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    jobTitle: v.optional(v.string()),
    team: v.optional(v.string()),
    specialism: v.optional(v.string()),
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
    category: v.string(),
    isSystem: v.boolean(),
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
    name: v.string(),
    code: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    academicYearId: v.id("academic_years"),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_academic_year", ["academicYearId"])
    .index("by_order", ["order"]),

  departments: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    facultyId: v.optional(v.id("faculties")),
    headOfDepartmentId: v.optional(v.id("user_profiles")),
    organisationId: v.optional(v.id("organisations")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_faculty", ["facultyId"])
    .index("by_organisation", ["organisationId"]),

  faculties: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    deanId: v.optional(v.id("user_profiles")),
    organisationId: v.optional(v.id("organisations")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_organisation", ["organisationId"]),

  teams: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    teamType: v.string(),
    level: v.string(),
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
    parentTeamId: v.optional(v.id("teams")),
    teamLeaderId: v.optional(v.id("user_profiles")),
    deputyLeaderId: v.optional(v.id("user_profiles")),
    academicYearId: v.optional(v.id("academic_years")),
    memberCount: v.optional(v.number()),
    maxMembers: v.optional(v.number()),
    defaultWorkloadHours: v.optional(v.number()),
    workloadDistribution: v.optional(v.object({
      teaching: v.optional(v.number()),
      research: v.optional(v.number()),
      admin: v.optional(v.number()),
      other: v.optional(v.number()),
    })),
    isActive: v.boolean(),
    isSystem: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_department", ["departmentId"])
    .index("by_faculty", ["facultyId"])
    .index("by_academic_year", ["academicYearId"])
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
    isActive: v.boolean(),
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
    allocatedResearchHours: v.number(),
    allocatedOtherHours: v.number(),
    notes: v.optional(v.string()),
    yearSpecificData: v.optional(v.any()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
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
    allocationTypeId: v.optional(v.id("allocation_types")),
    category: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    hours: v.number(),
    hoursPerWeek: v.optional(v.number()),
    weeksPerYear: v.optional(v.number()),
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
    .index("by_allocation_type", ["allocationTypeId"])
    .index("by_organisation", ["organisationId"]),

  // 4. Course & Module Tables
  courses: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    facultyId: v.optional(v.id("faculties")),
    departmentId: v.optional(v.id("departments")),
    credits: v.number(),
    duration: v.number(),
    level: v.string(),
    courseLeaderId: v.optional(v.id("user_profiles")),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    entryRequirements: v.optional(v.string()),
    learningOutcomes: v.optional(v.array(v.string())),
    isAccredited: v.boolean(),
    accreditationBody: v.optional(v.string()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_organisation", ["organisationId"]),

  cohorts: defineTable({
    name: v.string(),
    code: v.string(),
    courseId: v.id("courses"),
    academicYearId: v.id("academic_years"),
    entryYear: v.number(),
    isFullTime: v.boolean(),
    startDate: v.string(),
    endDate: v.string(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  module_profiles: defineTable({
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

  modules: defineTable({
    profileId: v.id("module_profiles"),
    academicYearId: v.id("academic_years"),
    status: v.string(),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
    yearSpecificData: v.optional(v.any()),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_profile", ["profileId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  course_modules: defineTable({
    courseId: v.id("courses"),
    moduleId: v.id("modules"),
    yearOfStudy: v.number(),
    prerequisites: v.optional(v.array(v.id("modules"))),
    coRequisites: v.optional(v.array(v.id("modules"))),
    isCore: v.boolean(),
    isOptional: v.boolean(),
    order: v.optional(v.number()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_module", ["moduleId"])
    .index("by_organisation", ["organisationId"]),

  cohort_module_plans: defineTable({
    cohortId: v.id("cohorts"),
    moduleId: v.id("modules"),
    academicYearId: v.id("academic_years"),
    semester: v.number(),
    semesterPeriodId: v.optional(v.id("semester_periods")),
    plannedStartDate: v.optional(v.string()),
    plannedEndDate: v.optional(v.string()),
    expectedEnrollment: v.optional(v.number()),
    actualEnrollment: v.optional(v.number()),
    deliveryMode: v.string(),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    isConfirmed: v.boolean(),
    isPlanned: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_cohort", ["cohortId"])
    .index("by_module", ["moduleId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  // 5. Module Delivery Tables
  module_iterations: defineTable({
    moduleId: v.id("modules"),
    academicYearId: v.id("academic_years"),
    semesterPeriodId: v.optional(v.id("semester_periods")),
    iterationCode: v.string(),
    description: v.optional(v.string()),
    deliveryMode: v.string(),
    deliveryLocation: v.string(),
    virtualRoomUrl: v.optional(v.string()),
    expectedEnrollment: v.optional(v.number()),
    actualEnrollment: v.optional(v.number()),
    maxEnrollment: v.optional(v.number()),
    isFull: v.boolean(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    teachingStartDate: v.optional(v.number()),
    teachingEndDate: v.optional(v.number()),
    status: v.string(),
    isActive: v.boolean(),
    metadata: v.optional(v.any()),
    notes: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_module", ["moduleId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_semester_period", ["semesterPeriodId"])
    .index("by_organisation", ["organisationId"]),

  module_iteration_groups: defineTable({
    moduleIterationId: v.id("module_iterations"),
    name: v.string(),
    code: v.string(),
    groupType: v.string(),
    size: v.number(),
    maxSize: v.optional(v.number()),
    currentSize: v.optional(v.number()),
    isFull: v.boolean(),
    lecturerId: v.optional(v.id("lecturers")),
    siteId: v.optional(v.id("sites")),
    roomId: v.optional(v.string()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_module_iteration", ["moduleIterationId"])
    .index("by_lecturer", ["lecturerId"])
    .index("by_organisation", ["organisationId"]),

  sites: defineTable({
    name: v.string(),
    code: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    isMainSite: v.boolean(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_organisation", ["organisationId"]),

  assessment_types: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    defaultWeighting: v.optional(v.number()),
    defaultDuration: v.optional(v.number()),
    isGroupAssessment: v.boolean(),
    requiresMarking: v.boolean(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_organisation", ["organisationId"]),

  module_iteration_assessments: defineTable({
    moduleIterationId: v.id("module_iterations"),
    assessmentTypeId: v.optional(v.id("assessment_types")),
    title: v.string(),
    type: v.string(),
    weighting: v.number(),
    submissionDate: v.string(),
    marksDueDate: v.string(),
    dueDate: v.string(),
    isSecondAttempt: v.boolean(),
    externalExaminerRequired: v.boolean(),
    alertsToTeam: v.boolean(),
    isGroupAssessment: v.boolean(),
    maxGroupSize: v.optional(v.number()),
    minGroupSize: v.optional(v.number()),
    isPublished: v.boolean(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_module_iteration", ["moduleIterationId"])
    .index("by_assessment_type", ["assessmentTypeId"])
    .index("by_organisation", ["organisationId"]),

  allocation_types: defineTable({
    name: v.string(),
    code: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    defaultHours: v.optional(v.number()),
    defaultStudents: v.optional(v.number()),
    isTeaching: v.boolean(),
    isAssessment: v.boolean(),
    isAdministrative: v.boolean(),
    requiresRoom: v.boolean(),
    canBeGrouped: v.boolean(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_organisation", ["organisationId"]),

  module_allocations: defineTable({
    lecturerId: v.id("lecturers"),
    moduleCode: v.string(),
    moduleName: v.string(),
    hoursAllocated: v.number(),
    type: v.string(),
    semester: v.string(),
    groupNumber: v.number(),
    siteName: v.string(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lecturer", ["lecturerId"])
    .index("by_organisation", ["organisationId"]),

  // 6. Reporting & Analytics Tables
  team_summaries: defineTable({
    teamId: v.id("teams"),
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
    academicYearId: v.id("academic_years"),
    period: v.string(),
    totalLecturers: v.number(),
    totalTeachingHours: v.number(),
    totalAdminHours: v.number(),
    totalOtherHours: v.number(),
    averageWorkload: v.number(),
    averageWorkloadPerLecturer: v.number(),
    lastCalculatedAt: v.number(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_team", ["teamId"])
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  workload_reports: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    academicYearId: v.id("academic_years"),
    reportType: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    status: v.string(),
    format: v.string(),
    fileUrl: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    filters: v.optional(v.object({
      departments: v.optional(v.array(v.id("departments"))),
      faculties: v.optional(v.array(v.id("faculties"))),
      teams: v.optional(v.array(v.id("teams"))),
      lecturers: v.optional(v.array(v.id("lecturers"))),
      modules: v.optional(v.array(v.id("modules"))),
      allocationTypes: v.optional(v.array(v.id("allocation_types"))),
      workloadRange: v.optional(v.object({
        min: v.number(),
        max: v.number(),
      })),
    })),
    metrics: v.optional(v.object({
      totalLecturers: v.number(),
      totalModules: v.number(),
      totalAllocations: v.number(),
      totalTeachingHours: v.number(),
      totalAssessmentHours: v.number(),
      totalAdminHours: v.number(),
      averageWorkload: v.number(),
      maxWorkload: v.number(),
      minWorkload: v.number(),
    })),
    data: v.any(),
    generatedBy: v.string(),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_academic_year", ["academicYearId"])
    .index("by_organisation", ["organisationId"]),

  workload_calculation_rules: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ruleType: v.string(),
    category: v.string(),
    formula: v.string(),
    variables: v.array(v.object({
      name: v.string(),
      description: v.string(),
      type: v.string(),
      defaultValue: v.optional(v.any()),
      required: v.boolean(),
    })),
    conditions: v.optional(v.array(v.object({
      field: v.string(),
      operator: v.string(),
      value: v.any(),
      logicalOperator: v.optional(v.string()),
    }))),
    multiplier: v.optional(v.number()),
    minimumHours: v.optional(v.number()),
    maximumHours: v.optional(v.number()),
    roundingRule: v.string(),
    decimalPlaces: v.optional(v.number()),
    priority: v.optional(v.number()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
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

  user_role_assignments: defineTable({
    userId: v.string(),
    roleId: v.id("user_roles"),
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

  tags: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    isActive: v.boolean(),
    organisationId: v.optional(v.id("organisations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organisation", ["organisationId"]),
}); 