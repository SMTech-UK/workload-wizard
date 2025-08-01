import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  moduleIterationId: v.id("module_iterations"),
  assessmentTypeId: v.id("assessment_types"),
  name: v.string(),
  description: v.optional(v.string()),
  weighting: v.number(), // Percentage weight of this assessment
  duration: v.optional(v.number()), // Duration in minutes
  dueDate: v.optional(v.string()), // ISO date string
  submissionDate: v.optional(v.string()), // ISO date string
  isGroupAssessment: v.boolean(), // Whether this is a group assessment
  maxGroupSize: v.optional(v.number()), // Maximum group size if group assessment
  minGroupSize: v.optional(v.number()), // Minimum group size if group assessment
  isActive: v.boolean(),
  isPublished: v.boolean(), // Whether assessment details are published to students
  markingScheme: v.optional(v.string()), // Description of marking criteria
  notes: v.optional(v.string()),
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all module iteration assessments
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_assessments")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get module iteration assessment by ID
export const getById = query({
  args: { id: v.id("module_iteration_assessments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const assessment = await ctx.db.get(args.id);
    if (!assessment || assessment.deletedAt) return null;
    return assessment;
  },
});

// Get assessments by module iteration
export const getByModuleIteration = query({
  args: { moduleIterationId: v.id("module_iterations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_assessments")
      .filter((q) => q.eq(q.field("moduleIterationId"), args.moduleIterationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get published assessments
export const getPublishedAssessments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_assessments")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get group assessments
export const getGroupAssessments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_assessments")
      .filter((q) => q.eq(q.field("isGroupAssessment"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get assessments by assessment type
export const getByAssessmentType = query({
  args: { assessmentTypeId: v.id("assessment_types") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_assessments")
      .filter((q) => q.eq(q.field("assessmentTypeId"), args.assessmentTypeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get assessments due in date range
export const getDueInRange = query({
  args: { 
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_assessments")
      .filter((q) => q.gte(q.field("dueDate"), args.startDate))
      .filter((q) => q.lte(q.field("dueDate"), args.endDate))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Create a new module iteration assessment
export const create = mutation({
  args: {
    moduleIterationId: v.id("module_iterations"),
    assessmentTypeId: v.id("assessment_types"),
    name: v.string(),
    description: v.optional(v.string()),
    weighting: v.number(),
    duration: v.optional(v.number()),
    dueDate: v.optional(v.string()),
    submissionDate: v.optional(v.string()),
    isGroupAssessment: v.optional(v.boolean()),
    maxGroupSize: v.optional(v.number()),
    minGroupSize: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
    markingScheme: v.optional(v.string()),
    notes: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Validate weighting
    if (args.weighting < 0 || args.weighting > 100) {
      throw new Error("Weighting must be between 0 and 100");
    }
    
    // Validate duration if provided
    if (args.duration !== undefined) {
      if (args.duration <= 0) {
        throw new Error("Duration must be greater than 0");
      }
    }
    
    // Validate dates if provided
    if (args.dueDate && args.submissionDate) {
      if (new Date(args.dueDate) < new Date(args.submissionDate)) {
        throw new Error("Due date must be after submission date");
      }
    }
    
    // Validate group sizes if group assessment
    if (args.isGroupAssessment) {
      if (args.maxGroupSize !== undefined && args.minGroupSize !== undefined) {
        if (args.maxGroupSize < args.minGroupSize) {
          throw new Error("Max group size must be greater than or equal to min group size");
        }
      }
      if (args.minGroupSize !== undefined && args.minGroupSize <= 0) {
        throw new Error("Min group size must be greater than 0");
      }
      if (args.maxGroupSize !== undefined && args.maxGroupSize <= 0) {
        throw new Error("Max group size must be greater than 0");
      }
    }
    
    return await ctx.db.insert("module_iteration_assessments", {
      moduleIterationId: args.moduleIterationId,
      assessmentTypeId: args.assessmentTypeId,
      title: args.name,
      type: "assessment",
      weighting: args.weighting,
      submissionDate: args.submissionDate || "",
      marksDueDate: args.dueDate || "",
      dueDate: args.dueDate || "",
      isSecondAttempt: false,
      externalExaminerRequired: false,
      alertsToTeam: false,
      isGroupAssessment: args.isGroupAssessment ?? false,
      isActive: true,
      isPublished: args.isPublished ?? false,
      organisationId: args.organisationId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a module iteration assessment
export const update = mutation({
  args: {
    id: v.id("module_iteration_assessments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    weighting: v.optional(v.number()),
    duration: v.optional(v.number()),
    dueDate: v.optional(v.string()),
    submissionDate: v.optional(v.string()),
    isGroupAssessment: v.optional(v.boolean()),
    maxGroupSize: v.optional(v.number()),
    minGroupSize: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
    markingScheme: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // Validate weighting if provided
    if (updates.weighting !== undefined) {
      if (updates.weighting < 0 || updates.weighting > 100) {
        throw new Error("Weighting must be between 0 and 100");
      }
    }
    
    // Validate duration if provided
    if (updates.duration !== undefined) {
      if (updates.duration <= 0) {
        throw new Error("Duration must be greater than 0");
      }
    }
    
    // Validate dates if provided
    if (updates.dueDate && updates.submissionDate) {
      if (new Date(updates.dueDate) < new Date(updates.submissionDate)) {
        throw new Error("Due date must be after submission date");
      }
    }
    
    // Validate group sizes if group assessment
    if (updates.isGroupAssessment || updates.maxGroupSize !== undefined || updates.minGroupSize !== undefined) {
      const current = await ctx.db.get(id);
      const isGroupAssessment = updates.isGroupAssessment ?? current?.isGroupAssessment;
      
      if (isGroupAssessment) {
        const maxGroupSize = updates.maxGroupSize ?? current?.maxGroupSize;
        const minGroupSize = updates.minGroupSize ?? current?.minGroupSize;
        
        if (maxGroupSize !== undefined && minGroupSize !== undefined) {
          if (maxGroupSize < minGroupSize) {
            throw new Error("Max group size must be greater than or equal to min group size");
          }
        }
        if (minGroupSize !== undefined && minGroupSize <= 0) {
          throw new Error("Min group size must be greater than 0");
        }
        if (maxGroupSize !== undefined && maxGroupSize <= 0) {
          throw new Error("Max group size must be greater than 0");
        }
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a module iteration assessment
export const remove = mutation({
  args: { id: v.id("module_iteration_assessments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get module iteration assessments with full relationship information
export const getAllWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const assessments = await ctx.db
      .query("module_iteration_assessments")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
    
    // Fetch related information for each assessment
    const assessmentsWithRelations = await Promise.all(
      assessments.map(async (assessment) => {
        const moduleIteration = await ctx.db.get(assessment.moduleIterationId);
        const assessmentType = assessment.assessmentTypeId ? await ctx.db.get(assessment.assessmentTypeId) : null;
        
        return {
          ...assessment,
          moduleIteration,
          assessmentType,
        };
      })
    );
    
    return assessmentsWithRelations;
  },
}); 