import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all cohorts
export const getAll = query({
  args: {
    courseId: v.optional(v.id("courses")),
    academicYearId: v.optional(v.id("academic_years")),
    isActive: v.optional(v.boolean()),
  },
  returns: v.array(v.object({
    _id: v.id("cohorts"),
    _creationTime: v.number(),
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
  })),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    let query = ctx.db.query("cohorts")
      .filter(q => q.eq(q.field("organisationId"), organisation._id))
      .filter(q => q.eq(q.field("isActive"), true));
    
    if (args.courseId) {
      query = query.filter(q => q.eq(q.field("courseId"), args.courseId));
    }
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Get cohort by ID with related module plans
export const getById = query({
  args: { id: v.id("cohorts") },
  returns: v.union(
    v.object({
      _id: v.id("cohorts"),
      _creationTime: v.number(),
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
      modulePlans: v.array(v.union(
        v.object({
          _id: v.id("cohort_module_plans"),
          _creationTime: v.number(),
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
          module: v.object({
            _id: v.id("modules"),
            _creationTime: v.number(),
            profileId: v.id("module_profiles"),
            academicYearId: v.id("academic_years"),
            status: v.string(),
            isActive: v.boolean(),
            notes: v.optional(v.string()),
            organisationId: v.optional(v.id("organisations")),
            updatedAt: v.number(),
            deletedAt: v.optional(v.number()),
            // Profile data (joined)
            code: v.string(),
            title: v.string(),
            credits: v.number(),
            level: v.number(),
            moduleLeader: v.string(),
            defaultTeachingHours: v.number(),
            defaultMarkingHours: v.number(),
          }),
        }),
        v.null()
      )),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const cohort = await ctx.db.get(args.id);
    if (!cohort) return null;
    
    // Get related course module plans for this cohort
    const cohortModulePlans = await ctx.db.query("cohort_module_plans")
      .filter(q => q.eq(q.field("cohortId"), args.id))
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
    
    // Get module details for each plan
    const plansWithDetails = await Promise.all(
      cohortModulePlans.map(async (plan) => {
        const module = await ctx.db.get(plan.moduleId);
        if (!module) return null;
        
        // Get module profile data
        const profile = await ctx.db.get(module.profileId);
        if (!profile) return null;
        
        return {
          ...plan,
          module: {
            ...module,
            code: profile.code,
            title: profile.title,
            credits: profile.credits,
            level: profile.level,
            moduleLeader: profile.moduleLeader,
            defaultTeachingHours: profile.defaultTeachingHours,
            defaultMarkingHours: profile.defaultMarkingHours,
          },
        };
      })
    );
    
    return {
      ...cohort,
      modulePlans: plansWithDetails.filter(Boolean),
    };
  },
});

// Create a new cohort
export const create = mutation({
  args: {
    courseId: v.id("courses"),
    academicYearId: v.id("academic_years"),
    name: v.string(),
    code: v.string(),
    entryYear: v.number(),
    isFullTime: v.boolean(),
    startDate: v.string(),
    endDate: v.string(),
    isActive: v.optional(v.boolean()),
  },
  returns: v.id("cohorts"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Validate input data
    if (args.startDate >= args.endDate) {
      throw new Error("Start date must be before end date");
    }
    
    if (args.entryYear < 2000 || args.entryYear > 2100) {
      throw new Error("Entry year must be between 2000 and 2100");
    }
    
    // Validate that course exists and belongs to this organisation
    const course = await ctx.db.get(args.courseId);
    if (!course || course.organisationId !== organisation._id) {
      throw new Error("Course not found or does not belong to this organisation");
    }
    
    // Check if cohort code already exists for this course and academic year
    const existingCohort = await ctx.db.query("cohorts")
      .filter(q => 
        q.and(
          q.eq(q.field("code"), args.code),
          q.eq(q.field("courseId"), args.courseId),
          q.eq(q.field("academicYearId"), args.academicYearId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingCohort) {
      throw new Error("Cohort code already exists for this course and academic year");
    }
    
    const cohortId = await ctx.db.insert("cohorts", {
      ...args,
      isActive: args.isActive ?? true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "cohorts",
      entityId: cohortId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return cohortId;
  },
});

// Update a cohort
export const update = mutation({
  args: {
    id: v.id("cohorts"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    entryYear: v.optional(v.number()),
    isFullTime: v.optional(v.boolean()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    const { id, ...updates } = args;
    
    // Validate date ranges if dates are being updated
    if (updates.startDate !== undefined || updates.endDate !== undefined) {
      const currentCohort = await ctx.db.get(id);
      if (currentCohort) {
        const startDate = updates.startDate ?? currentCohort.startDate;
        const endDate = updates.endDate ?? currentCohort.endDate;
        if (startDate >= endDate) {
          throw new Error("Start date must be before end date");
        }
      }
    }
    
    // Validate entryYear
    if (updates.entryYear !== undefined && (updates.entryYear < 2000 || updates.entryYear > 2100)) {
      throw new Error("Entry year must be between 2000 and 2100");
    }
    
    // Check if cohort code already exists (if being updated)
    if (updates.code) {
      const currentCohort = await ctx.db.get(id);
      if (currentCohort) {
        const existingCohort = await ctx.db.query("cohorts")
          .filter(q => 
            q.and(
              q.eq(q.field("code"), updates.code),
              q.eq(q.field("courseId"), currentCohort.courseId),
              q.eq(q.field("academicYearId"), currentCohort.academicYearId),
              q.eq(q.field("organisationId"), organisation._id),
              q.neq(q.field("_id"), id)
            )
          )
          .first();
        
        if (existingCohort) {
          throw new Error("Cohort code already exists for this course and academic year");
        }
      }
    }
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "cohorts",
      entityId: id,
      changes: updates,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

// Delete a cohort (soft delete)
export const remove = mutation({
  args: { id: v.id("cohorts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();

    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "delete",
      entityType: "cohorts",
      entityId: args.id,
      changes: { deletedAt: Date.now() },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

// Add module plan to cohort
export const addModulePlan = mutation({
  args: {
    cohortId: v.id("cohorts"),
    moduleId: v.id("modules"),
    academicYearId: v.id("academic_years"),
    semester: v.number(),
    deliveryMode: v.string(),
    semesterPeriodId: v.optional(v.id("semester_periods")),
    plannedStartDate: v.optional(v.string()),
    plannedEndDate: v.optional(v.string()),
    expectedEnrollment: v.optional(v.number()),
    actualEnrollment: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isConfirmed: v.optional(v.boolean()),
    isPlanned: v.optional(v.boolean()),
  },
  returns: v.id("cohort_module_plans"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Validate semester
    if (args.semester < 1 || args.semester > 4) {
      throw new Error("Semester must be between 1 and 4");
    }
    
    // Validate that cohort and module exist and belong to this organisation
    const cohort = await ctx.db.get(args.cohortId);
    if (!cohort || cohort.organisationId !== organisation._id) {
      throw new Error("Cohort not found or does not belong to this organisation");
    }
    
    const module = await ctx.db.get(args.moduleId);
    if (!module || module.organisationId !== organisation._id) {
      throw new Error("Module not found or does not belong to this organisation");
    }
    
    // Check if module plan already exists for this cohort
    const existingPlan = await ctx.db.query("cohort_module_plans")
      .filter(q => 
        q.and(
          q.eq(q.field("cohortId"), args.cohortId),
          q.eq(q.field("moduleId"), args.moduleId),
          q.eq(q.field("academicYearId"), args.academicYearId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingPlan) {
      throw new Error("Module plan already exists for this cohort");
    }
    
    const planId = await ctx.db.insert("cohort_module_plans", {
      cohortId: args.cohortId,
      moduleId: args.moduleId,
      academicYearId: args.academicYearId,
      semester: args.semester,
      deliveryMode: args.deliveryMode,
      semesterPeriodId: args.semesterPeriodId,
      plannedStartDate: args.plannedStartDate,
      plannedEndDate: args.plannedEndDate,
      expectedEnrollment: args.expectedEnrollment,
      actualEnrollment: args.actualEnrollment,
      notes: args.notes,
      isActive: args.isActive ?? true,
      isConfirmed: args.isConfirmed ?? false,
      isPlanned: args.isPlanned ?? true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "cohort_module_plans",
      entityId: planId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return planId;
  },
});

// Remove module plan from cohort
export const removeModulePlan = mutation({
  args: {
    cohortId: v.id("cohorts"),
    moduleId: v.id("modules"),
    academicYearId: v.id("academic_years"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();

    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Find the module plan
    const modulePlan = await ctx.db.query("cohort_module_plans")
      .filter(q => 
        q.and(
          q.eq(q.field("cohortId"), args.cohortId),
          q.eq(q.field("moduleId"), args.moduleId),
          q.eq(q.field("academicYearId"), args.academicYearId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (!modulePlan) {
      throw new Error("Module plan not found");
    }
    
    // Soft delete the module plan
    await ctx.db.patch(modulePlan._id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "delete",
      entityType: "cohort_module_plans",
      entityId: modulePlan._id,
      changes: { cohortId: args.cohortId, moduleId: args.moduleId, academicYearId: args.academicYearId },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

// Get cohorts by course
export const getByCourse = query({
  args: { courseId: v.id("courses") },
  returns: v.array(v.object({
    _id: v.id("cohorts"),
    _creationTime: v.number(),
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
  })),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    return await ctx.db.query("cohorts")
      .filter(q => q.eq(q.field("courseId"), args.courseId))
      .filter(q => q.eq(q.field("organisationId"), organisation._id))
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get cohorts by academic year
export const getByAcademicYear = query({
  args: { academicYearId: v.id("academic_years") },
  returns: v.array(v.object({
    _id: v.id("cohorts"),
    _creationTime: v.number(),
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
  })),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    return await ctx.db.query("cohorts")
      .filter(q => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter(q => q.eq(q.field("organisationId"), organisation._id))
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get cohort module plans
export const getCohortModulePlans = query({
  args: { cohortId: v.id("cohorts") },
  returns: v.array(v.union(
    v.object({
      _id: v.id("cohort_module_plans"),
      _creationTime: v.number(),
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
      module: v.object({
        _id: v.id("modules"),
        _creationTime: v.number(),
        profileId: v.id("module_profiles"),
        academicYearId: v.id("academic_years"),
        status: v.string(),
        isActive: v.boolean(),
        notes: v.optional(v.string()),
        organisationId: v.optional(v.id("organisations")),
        updatedAt: v.number(),
        deletedAt: v.optional(v.number()),
        // Profile data (joined)
        code: v.string(),
        title: v.string(),
        credits: v.number(),
        level: v.number(),
        moduleLeader: v.string(),
        defaultTeachingHours: v.number(),
        defaultMarkingHours: v.number(),
      }),
    }),
    v.null()
  )),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Get cohort module plans
    const cohortModulePlans = await ctx.db.query("cohort_module_plans")
      .filter(q => q.eq(q.field("cohortId"), args.cohortId))
      .filter(q => q.eq(q.field("organisationId"), organisation._id))
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
    
    // Get module details for each plan
    const plansWithDetails = await Promise.all(
      cohortModulePlans.map(async (plan) => {
        const module = await ctx.db.get(plan.moduleId);
        if (!module) return null;
        
        // Get module profile data
        const profile = await ctx.db.get(module.profileId);
        if (!profile) return null;
        
        return {
          ...plan,
          module: {
            ...module,
            code: profile.code,
            title: profile.title,
            credits: profile.credits,
            level: profile.level,
            moduleLeader: profile.moduleLeader,
            defaultTeachingHours: profile.defaultTeachingHours,
            defaultMarkingHours: profile.defaultMarkingHours,
          },
        };
      })
    );
    
    return plansWithDetails.filter(Boolean);
  },
});

// Bulk import cohorts
export const bulkImport = mutation({
  args: {
    cohorts: v.array(
      v.object({
        courseId: v.id("courses"),
        academicYearId: v.id("academic_years"),
        name: v.string(),
        code: v.string(),
        entryYear: v.number(),
        isFullTime: v.boolean(),
        startDate: v.string(),
        endDate: v.string(),
        isActive: v.optional(v.boolean()),
      })
    ),
  },
  returns: v.array(v.object({
    success: v.boolean(),
    id: v.optional(v.id("cohorts")),
    code: v.string(),
    error: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    const results = [];
    for (const cohortData of args.cohorts) {
      try {
        // Validate input data
        if (cohortData.startDate >= cohortData.endDate) {
          throw new Error("Start date must be before end date");
        }
        
        if (cohortData.entryYear < 2000 || cohortData.entryYear > 2100) {
          throw new Error("Entry year must be between 2000 and 2100");
        }
        
        // Validate that course exists and belongs to this organisation
        const course = await ctx.db.get(cohortData.courseId);
        if (!course || course.organisationId !== organisation._id) {
          throw new Error(`Course not found or does not belong to this organisation for cohort ${cohortData.code}`);
        }
        
        // Check if cohort code already exists for this course and academic year
        const existingCohort = await ctx.db.query("cohorts")
          .filter(q => 
            q.and(
              q.eq(q.field("code"), cohortData.code),
              q.eq(q.field("courseId"), cohortData.courseId),
              q.eq(q.field("academicYearId"), cohortData.academicYearId),
              q.eq(q.field("organisationId"), organisation._id)
            )
          )
          .first();
        
        if (existingCohort) {
          throw new Error(`Cohort code ${cohortData.code} already exists for this course and academic year`);
        }
        
        const cohortId = await ctx.db.insert("cohorts", {
          ...cohortData,
          isActive: cohortData.isActive ?? true,
          organisationId: organisation._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        results.push({ success: true, id: cohortId, code: cohortData.code });
      } catch (error) {
        results.push({ success: false, code: cohortData.code, error: String(error) });
      }
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "bulk_import",
      entityType: "cohorts",
      entityId: "bulk",
      changes: { 
        total: args.cohorts.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length 
      },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return results;
  },
});