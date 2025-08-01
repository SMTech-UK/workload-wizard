import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  courseId: v.id("courses"),
  moduleId: v.id("modules"),
  isCore: v.boolean(), // Whether this is a core module for the course
  isOptional: v.boolean(), // Whether this is an optional module
  yearOfStudy: v.number(), // Which year of the course this module is taught
  semester: v.optional(v.string()), // e.g., "Autumn", "Spring", "Both"
  credits: v.number(), // Credits for this module in this course context
  prerequisites: v.optional(v.array(v.id("modules"))), // Module IDs that must be completed first
  coRequisites: v.optional(v.array(v.id("modules"))), // Module IDs that must be taken together
  isActive: v.boolean(),
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all course-module relationships
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("course_modules")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get modules for a specific course
export const getByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("course_modules")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get courses for a specific module
export const getByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("course_modules")
      .filter((q) => q.eq(q.field("moduleId"), args.moduleId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get core modules for a course
export const getCoreModulesByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("course_modules")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .filter((q) => q.eq(q.field("isCore"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get optional modules for a course
export const getOptionalModulesByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("course_modules")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .filter((q) => q.eq(q.field("isOptional"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get modules by year of study for a course
export const getByYearOfStudy = query({
  args: { 
    courseId: v.id("courses"),
    yearOfStudy: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("course_modules")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .filter((q) => q.eq(q.field("yearOfStudy"), args.yearOfStudy))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get course-module relationship by ID
export const getById = query({
  args: { id: v.id("course_modules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const courseModule = await ctx.db.get(args.id);
    if (!courseModule || courseModule.deletedAt) return null;
    return courseModule;
  },
});

// Create a new course-module relationship
export const create = mutation({
  args: {
    courseId: v.id("courses"),
    moduleId: v.id("modules"),
    isCore: v.optional(v.boolean()),
    isOptional: v.optional(v.boolean()),
    yearOfStudy: v.number(),
    semester: v.optional(v.string()),
    credits: v.number(),
    prerequisites: v.optional(v.array(v.id("modules"))),
    coRequisites: v.optional(v.array(v.id("modules"))),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if relationship already exists
    const existing = await ctx.db
      .query("course_modules")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .filter((q) => q.eq(q.field("moduleId"), args.moduleId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Course-module relationship already exists");
    }
    
    // Validate credits
    if (args.credits <= 0) {
      throw new Error("Credits must be greater than 0");
    }
    
    // Validate year of study
    if (args.yearOfStudy <= 0) {
      throw new Error("Year of study must be greater than 0");
    }
    
    return await ctx.db.insert("course_modules", {
      ...args,
      isCore: args.isCore ?? false,
      isOptional: args.isOptional ?? false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a course-module relationship
export const update = mutation({
  args: {
    id: v.id("course_modules"),
    isCore: v.optional(v.boolean()),
    isOptional: v.optional(v.boolean()),
    yearOfStudy: v.optional(v.number()),
    semester: v.optional(v.string()),
    credits: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.id("modules"))),
    coRequisites: v.optional(v.array(v.id("modules"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // Validate credits if provided
    if (updates.credits !== undefined) {
      if (updates.credits <= 0) {
        throw new Error("Credits must be greater than 0");
      }
    }
    
    // Validate year of study if provided
    if (updates.yearOfStudy !== undefined) {
      if (updates.yearOfStudy <= 0) {
        throw new Error("Year of study must be greater than 0");
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a course-module relationship
export const remove = mutation({
  args: { id: v.id("course_modules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get course-module relationships with full module and course information
export const getAllWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const courseModules = await ctx.db
      .query("course_modules")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
    
    // Fetch related information for each course-module relationship
    const courseModulesWithRelations = await Promise.all(
      courseModules.map(async (courseModule) => {
        const course = await ctx.db.get(courseModule.courseId);
        const module = await ctx.db.get(courseModule.moduleId);
        
        // Fetch prerequisite modules
        let prerequisites: any[] = [];
        if (courseModule.prerequisites) {
          prerequisites = await Promise.all(
            courseModule.prerequisites.map(async (prereqId) => {
              return await ctx.db.get(prereqId);
            })
          );
        }
        
        // Fetch co-requisite modules
        let coRequisites: any[] = [];
        if (courseModule.coRequisites) {
          coRequisites = await Promise.all(
            courseModule.coRequisites.map(async (coreqId) => {
              return await ctx.db.get(coreqId);
            })
          );
        }
        
        return {
          ...courseModule,
          course,
          module,
          prerequisites,
          coRequisites,
        };
      })
    );
    
    return courseModulesWithRelations;
  },
}); 