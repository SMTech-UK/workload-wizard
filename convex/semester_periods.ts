import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  name: v.string(), // e.g., "Autumn Semester", "Spring Semester", "Summer Term"
  code: v.string(), // e.g., "AUT", "SPR", "SUM"
  academicYearId: v.id("academic_years"),
  startDate: v.string(), // ISO date string
  endDate: v.string(), // ISO date string
  teachingStartDate: v.optional(v.string()), // ISO date string
  teachingEndDate: v.optional(v.string()), // ISO date string
  assessmentPeriodStart: v.optional(v.string()), // ISO date string
  assessmentPeriodEnd: v.optional(v.string()), // ISO date string
  isActive: v.boolean(),
  description: v.optional(v.string()),
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all semester periods
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("semester_periods")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get semester periods by academic year
export const getByAcademicYear = query({
  args: { academicYearId: v.id("academic_years") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("semester_periods")
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get semester period by ID
export const getById = query({
  args: { id: v.id("semester_periods") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const period = await ctx.db.get(args.id);
    if (!period || period.deletedAt) return null;
    return period;
  },
});

// Get current semester period
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const now = new Date().toISOString();
    
    return await ctx.db
      .query("semester_periods")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .filter((q) => q.lte(q.field("startDate"), now))
      .filter((q) => q.gte(q.field("endDate"), now))
      .first();
  },
});

// Create a new semester period
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    academicYearId: v.id("academic_years"),
    startDate: v.string(),
    endDate: v.string(),
    order: v.optional(v.number()),
    teachingStartDate: v.optional(v.string()),
    teachingEndDate: v.optional(v.string()),
    assessmentPeriodStart: v.optional(v.string()),
    assessmentPeriodEnd: v.optional(v.string()),
    description: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if code already exists for this academic year
    const existing = await ctx.db
      .query("semester_periods")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Semester period code already exists for this academic year");
    }
    
    // Validate dates
    if (new Date(args.startDate) >= new Date(args.endDate)) {
      throw new Error("Start date must be before end date");
    }
    
    if (args.teachingStartDate && args.teachingEndDate) {
      if (new Date(args.teachingStartDate) >= new Date(args.teachingEndDate)) {
        throw new Error("Teaching start date must be before teaching end date");
      }
    }
    
    if (args.assessmentPeriodStart && args.assessmentPeriodEnd) {
      if (new Date(args.assessmentPeriodStart) >= new Date(args.assessmentPeriodEnd)) {
        throw new Error("Assessment period start date must be before assessment period end date");
      }
    }
    
    return await ctx.db.insert("semester_periods", {
      ...args,
      order: args.order || 1,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a semester period
export const update = mutation({
  args: {
    id: v.id("semester_periods"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    teachingStartDate: v.optional(v.string()),
    teachingEndDate: v.optional(v.string()),
    assessmentPeriodStart: v.optional(v.string()),
    assessmentPeriodEnd: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // If updating code, check for duplicates
    if (updates.code) {
      const current = await ctx.db.get(id);
      if (current) {
        const existing = await ctx.db
          .query("semester_periods")
          .filter((q) => q.eq(q.field("code"), updates.code))
          .filter((q) => q.eq(q.field("academicYearId"), current.academicYearId))
          .filter((q) => q.neq(q.field("_id"), id))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .first();
        
        if (existing) {
          throw new Error("Semester period code already exists for this academic year");
        }
      }
    }
    
    // Validate dates if provided
    if (updates.startDate && updates.endDate) {
      if (new Date(updates.startDate) >= new Date(updates.endDate)) {
        throw new Error("Start date must be before end date");
      }
    }
    
    if (updates.teachingStartDate && updates.teachingEndDate) {
      if (new Date(updates.teachingStartDate) >= new Date(updates.teachingEndDate)) {
        throw new Error("Teaching start date must be before teaching end date");
      }
    }
    
    if (updates.assessmentPeriodStart && updates.assessmentPeriodEnd) {
      if (new Date(updates.assessmentPeriodStart) >= new Date(updates.assessmentPeriodEnd)) {
        throw new Error("Assessment period start date must be before assessment period end date");
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a semester period
export const remove = mutation({
  args: { id: v.id("semester_periods") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get semester periods with academic year information
export const getAllWithAcademicYear = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const periods = await ctx.db
      .query("semester_periods")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
    
    // Fetch academic year information for each period
    const periodsWithAcademicYear = await Promise.all(
      periods.map(async (period) => {
        const academicYear = await ctx.db.get(period.academicYearId);
        
        return {
          ...period,
          academicYear,
        };
      })
    );
    
    return periodsWithAcademicYear;
  },
}); 