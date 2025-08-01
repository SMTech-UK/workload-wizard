import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  cohortId: v.id("cohorts"),
  moduleId: v.id("modules"),
  academicYearId: v.id("academic_years"),
  semesterPeriodId: v.optional(v.id("semester_periods")),
  isPlanned: v.boolean(), // Whether this module is planned for delivery
  isConfirmed: v.boolean(), // Whether delivery is confirmed
  plannedStartDate: v.optional(v.string()), // ISO date string
  plannedEndDate: v.optional(v.string()), // ISO date string
  expectedEnrollment: v.optional(v.number()),
  actualEnrollment: v.optional(v.number()),
  deliveryMode: v.string(), // e.g., "Face-to-face", "Online", "Hybrid", "Blended"
  notes: v.optional(v.string()),
  isActive: v.boolean(),
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all cohort module plans
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohort_module_plans")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get cohort module plan by ID
export const getById = query({
  args: { id: v.id("cohort_module_plans") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const plan = await ctx.db.get(args.id);
    if (!plan || plan.deletedAt) return null;
    return plan;
  },
});

// Get module plans by cohort
export const getByCohort = query({
  args: { cohortId: v.id("cohorts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohort_module_plans")
      .filter((q) => q.eq(q.field("cohortId"), args.cohortId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get module plans by academic year
export const getByAcademicYear = query({
  args: { academicYearId: v.id("academic_years") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohort_module_plans")
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get confirmed module plans
export const getConfirmedPlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohort_module_plans")
      .filter((q) => q.eq(q.field("isConfirmed"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get planned module plans
export const getPlannedPlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohort_module_plans")
      .filter((q) => q.eq(q.field("isPlanned"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get module plans by delivery mode
export const getByDeliveryMode = query({
  args: { deliveryMode: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohort_module_plans")
      .filter((q) => q.eq(q.field("deliveryMode"), args.deliveryMode))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Create a new cohort module plan
export const create = mutation({
  args: {
    cohortId: v.id("cohorts"),
    moduleId: v.id("modules"),
    academicYearId: v.id("academic_years"),
    semester: v.number(),
    semesterPeriodId: v.optional(v.id("semester_periods")),
    isPlanned: v.optional(v.boolean()),
    isConfirmed: v.optional(v.boolean()),
    plannedStartDate: v.optional(v.string()),
    plannedEndDate: v.optional(v.string()),
    expectedEnrollment: v.optional(v.number()),
    actualEnrollment: v.optional(v.number()),
    deliveryMode: v.string(),
    notes: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if plan already exists for this cohort-module-academic year combination
    const existing = await ctx.db
      .query("cohort_module_plans")
      .filter((q) => q.eq(q.field("cohortId"), args.cohortId))
      .filter((q) => q.eq(q.field("moduleId"), args.moduleId))
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Cohort module plan already exists for this combination");
    }
    
    // Validate dates if provided
    if (args.plannedStartDate && args.plannedEndDate) {
      if (new Date(args.plannedStartDate) >= new Date(args.plannedEndDate)) {
        throw new Error("Planned start date must be before planned end date");
      }
    }
    
    // Validate enrollment numbers if provided
    if (args.expectedEnrollment !== undefined) {
      if (args.expectedEnrollment < 0) {
        throw new Error("Expected enrollment cannot be negative");
      }
    }
    
    if (args.actualEnrollment !== undefined) {
      if (args.actualEnrollment < 0) {
        throw new Error("Actual enrollment cannot be negative");
      }
    }
    
    return await ctx.db.insert("cohort_module_plans", {
      ...args,
      isPlanned: args.isPlanned ?? true,
      isConfirmed: args.isConfirmed ?? false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a cohort module plan
export const update = mutation({
  args: {
    id: v.id("cohort_module_plans"),
    semesterPeriodId: v.optional(v.id("semester_periods")),
    isPlanned: v.optional(v.boolean()),
    isConfirmed: v.optional(v.boolean()),
    plannedStartDate: v.optional(v.string()),
    plannedEndDate: v.optional(v.string()),
    expectedEnrollment: v.optional(v.number()),
    actualEnrollment: v.optional(v.number()),
    deliveryMode: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // Validate dates if provided
    if (updates.plannedStartDate && updates.plannedEndDate) {
      if (new Date(updates.plannedStartDate) >= new Date(updates.plannedEndDate)) {
        throw new Error("Planned start date must be before planned end date");
      }
    }
    
    // Validate enrollment numbers if provided
    if (updates.expectedEnrollment !== undefined) {
      if (updates.expectedEnrollment < 0) {
        throw new Error("Expected enrollment cannot be negative");
      }
    }
    
    if (updates.actualEnrollment !== undefined) {
      if (updates.actualEnrollment < 0) {
        throw new Error("Actual enrollment cannot be negative");
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a cohort module plan
export const remove = mutation({
  args: { id: v.id("cohort_module_plans") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get cohort module plans with full relationship information
export const getAllWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const plans = await ctx.db
      .query("cohort_module_plans")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
    
    // Fetch related information for each plan
    const plansWithRelations = await Promise.all(
      plans.map(async (plan) => {
        const cohort = await ctx.db.get(plan.cohortId);
        const module = await ctx.db.get(plan.moduleId);
        const academicYear = await ctx.db.get(plan.academicYearId);
        
        let semesterPeriod = null;
        if (plan.semesterPeriodId) {
          semesterPeriod = await ctx.db.get(plan.semesterPeriodId);
        }
        
        return {
          ...plan,
          cohort,
          module,
          academicYear,
          semesterPeriod,
        };
      })
    );
    
    return plansWithRelations;
  },
}); 