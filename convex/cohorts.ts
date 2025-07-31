import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  name: v.string(),
  code: v.string(), // Cohort code (e.g., "CS2023", "MATH2024")
  description: v.optional(v.string()),
  courseId: v.id("courses"),
  academicYearId: v.id("academic_years"),
  startDate: v.string(), // ISO date string
  endDate: v.string(), // ISO date string
  expectedSize: v.optional(v.number()), // Expected number of students
  actualSize: v.optional(v.number()), // Actual number of students
  isActive: v.boolean(),
  isFullTime: v.boolean(), // Whether this is a full-time cohort
  modeOfStudy: v.string(), // e.g., "Full-time", "Part-time", "Distance Learning"
  entryYear: v.number(), // Year of entry
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all cohorts
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohorts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get cohort by ID
export const getById = query({
  args: { id: v.id("cohorts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const cohort = await ctx.db.get(args.id);
    if (!cohort || cohort.deletedAt) return null;
    return cohort;
  },
});

// Get cohorts by course
export const getByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohorts")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get cohorts by academic year
export const getByAcademicYear = query({
  args: { academicYearId: v.id("academic_years") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohorts")
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get cohort by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohorts")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
  },
});

// Get cohorts by entry year
export const getByEntryYear = query({
  args: { entryYear: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohorts")
      .filter((q) => q.eq(q.field("entryYear"), args.entryYear))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get full-time cohorts
export const getFullTimeCohorts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("cohorts")
      .filter((q) => q.eq(q.field("isFullTime"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Create a new cohort
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    courseId: v.id("courses"),
    academicYearId: v.id("academic_years"),
    startDate: v.string(),
    endDate: v.string(),
    expectedSize: v.optional(v.number()),
    actualSize: v.optional(v.number()),
    isFullTime: v.optional(v.boolean()),
    modeOfStudy: v.string(),
    entryYear: v.number(),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if code already exists
    const existing = await ctx.db
      .query("cohorts")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Cohort code already exists");
    }
    
    // Validate dates
    if (new Date(args.startDate) >= new Date(args.endDate)) {
      throw new Error("Start date must be before end date");
    }
    
    // Validate expected size if provided
    if (args.expectedSize !== undefined) {
      if (args.expectedSize <= 0) {
        throw new Error("Expected size must be greater than 0");
      }
    }
    
    // Validate actual size if provided
    if (args.actualSize !== undefined) {
      if (args.actualSize < 0) {
        throw new Error("Actual size cannot be negative");
      }
    }
    
    return await ctx.db.insert("cohorts", {
      ...args,
      isActive: true,
      isFullTime: args.isFullTime ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a cohort
export const update = mutation({
  args: {
    id: v.id("cohorts"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    expectedSize: v.optional(v.number()),
    actualSize: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isFullTime: v.optional(v.boolean()),
    modeOfStudy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // If updating code, check for duplicates
    if (updates.code) {
      const existing = await ctx.db
        .query("cohorts")
        .filter((q) => q.eq(q.field("code"), updates.code))
        .filter((q) => q.neq(q.field("_id"), id))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .first();
      
      if (existing) {
        throw new Error("Cohort code already exists");
      }
    }
    
    // Validate dates if provided
    if (updates.startDate && updates.endDate) {
      if (new Date(updates.startDate) >= new Date(updates.endDate)) {
        throw new Error("Start date must be before end date");
      }
    }
    
    // Validate expected size if provided
    if (updates.expectedSize !== undefined) {
      if (updates.expectedSize <= 0) {
        throw new Error("Expected size must be greater than 0");
      }
    }
    
    // Validate actual size if provided
    if (updates.actualSize !== undefined) {
      if (updates.actualSize < 0) {
        throw new Error("Actual size cannot be negative");
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a cohort
export const remove = mutation({
  args: { id: v.id("cohorts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get cohorts with course and academic year information
export const getAllWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const cohorts = await ctx.db
      .query("cohorts")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
    
    // Fetch related information for each cohort
    const cohortsWithRelations = await Promise.all(
      cohorts.map(async (cohort) => {
        const course = await ctx.db.get(cohort.courseId);
        const academicYear = await ctx.db.get(cohort.academicYearId);
        
        return {
          ...cohort,
          course,
          academicYear,
        };
      })
    );
    
    return cohortsWithRelations;
  },
});