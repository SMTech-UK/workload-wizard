import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  name: v.string(),
  code: v.string(), // Course code (e.g., "CS101", "MATH201")
  description: v.optional(v.string()),
  level: v.string(), // e.g., "Undergraduate", "Postgraduate", "Foundation"
  credits: v.number(), // Total credits for the course
  duration: v.number(), // Duration in years
  departmentId: v.optional(v.id("departments")),
  facultyId: v.optional(v.id("faculties")),
  courseLeaderId: v.optional(v.id("user_profiles")),
  contactEmail: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  website: v.optional(v.string()),
  entryRequirements: v.optional(v.string()),
  learningOutcomes: v.optional(v.array(v.string())),
  isActive: v.boolean(),
  isAccredited: v.boolean(), // Whether the course is professionally accredited
  accreditationBody: v.optional(v.string()),
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all courses
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get course by ID
export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const course = await ctx.db.get(args.id);
    if (!course || course.deletedAt) return null;
    return course;
  },
});

// Get course by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
  },
});

// Get courses by department
export const getByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("departmentId"), args.departmentId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get courses by faculty
export const getByFaculty = query({
  args: { facultyId: v.id("faculties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("facultyId"), args.facultyId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get courses by level
export const getByLevel = query({
  args: { level: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("level"), args.level))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get accredited courses
export const getAccreditedCourses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isAccredited"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Create a new course
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    level: v.string(),
    credits: v.number(),
    duration: v.number(),
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
    courseLeaderId: v.optional(v.id("user_profiles")),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    entryRequirements: v.optional(v.string()),
    learningOutcomes: v.optional(v.array(v.string())),
    isAccredited: v.optional(v.boolean()),
    accreditationBody: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if code already exists
    const existing = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Course code already exists");
    }
    
    // Validate credits
    if (args.credits <= 0) {
      throw new Error("Credits must be greater than 0");
    }
    
    // Validate duration
    if (args.duration <= 0) {
      throw new Error("Duration must be greater than 0");
    }
    
    return await ctx.db.insert("courses", {
      ...args,
      isActive: true,
      isAccredited: args.isAccredited ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a course
export const update = mutation({
  args: {
    id: v.id("courses"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    level: v.optional(v.string()),
    credits: v.optional(v.number()),
    duration: v.optional(v.number()),
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
    courseLeaderId: v.optional(v.id("user_profiles")),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    entryRequirements: v.optional(v.string()),
    learningOutcomes: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    isAccredited: v.optional(v.boolean()),
    accreditationBody: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // If updating code, check for duplicates
    if (updates.code) {
      const existing = await ctx.db
        .query("courses")
        .filter((q) => q.eq(q.field("code"), updates.code))
        .filter((q) => q.neq(q.field("_id"), id))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .first();
      
      if (existing) {
        throw new Error("Course code already exists");
      }
    }
    
    // Validate credits if provided
    if (updates.credits !== undefined) {
      if (updates.credits <= 0) {
        throw new Error("Credits must be greater than 0");
      }
    }
    
    // Validate duration if provided
    if (updates.duration !== undefined) {
      if (updates.duration <= 0) {
        throw new Error("Duration must be greater than 0");
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a course
export const remove = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get courses with department and faculty information
export const getAllWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
    
    // Fetch related information for each course
    const coursesWithRelations = await Promise.all(
      courses.map(async (course) => {
        let department = null;
        if (course.departmentId) {
          department = await ctx.db.get(course.departmentId);
        }
        
        let faculty = null;
        if (course.facultyId) {
          faculty = await ctx.db.get(course.facultyId);
        }
        
        let courseLeader = null;
        if (course.courseLeaderId) {
          courseLeader = await ctx.db.get(course.courseLeaderId);
        }
        
        return {
          ...course,
          department,
          faculty,
          courseLeader,
        };
      })
    );
    
    return coursesWithRelations;
  },
});

// Search courses by name or code
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
    
    // Filter by name or code (case-insensitive)
    const query = args.query.toLowerCase();
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query)
    );
  },
}); 