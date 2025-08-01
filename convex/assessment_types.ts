import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all assessment types (alias for getAll)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("assessment_types")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get all assessment types
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("assessment_types")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get assessment type by ID
export const getById = query({
  args: { id: v.id("assessment_types") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const assessmentType = await ctx.db.get(args.id);
    if (!assessmentType || assessmentType.deletedAt) return null;
    return assessmentType;
  },
});

// Get assessment types by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("assessment_types")
      .filter((q) => q.eq(q.field("category"), args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get assessment type by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("assessment_types")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
  },
});

// Get group assessment types
export const getGroupAssessmentTypes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("assessment_types")
      .filter((q) => q.eq(q.field("isGroupAssessment"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get assessment types that require marking
export const getMarkingRequiredTypes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("assessment_types")
      .filter((q) => q.eq(q.field("requiresMarking"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Create a new assessment type
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    defaultWeighting: v.optional(v.number()),
    defaultDuration: v.optional(v.number()),
    isGroupAssessment: v.optional(v.boolean()),
    requiresMarking: v.optional(v.boolean()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if code already exists
    const existing = await ctx.db
      .query("assessment_types")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Assessment type code already exists");
    }
    
    // Validate default weighting if provided
    if (args.defaultWeighting !== undefined) {
      if (args.defaultWeighting < 0 || args.defaultWeighting > 100) {
        throw new Error("Default weighting must be between 0 and 100");
      }
    }
    
    // Validate default duration if provided
    if (args.defaultDuration !== undefined) {
      if (args.defaultDuration <= 0) {
        throw new Error("Default duration must be greater than 0");
      }
    }
    
    return await ctx.db.insert("assessment_types", {
      ...args,
      isGroupAssessment: args.isGroupAssessment ?? false,
      requiresMarking: args.requiresMarking ?? true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update an assessment type
export const update = mutation({
  args: {
    id: v.id("assessment_types"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    defaultWeighting: v.optional(v.number()),
    defaultDuration: v.optional(v.number()),
    isGroupAssessment: v.optional(v.boolean()),
    requiresMarking: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // If updating code, check for duplicates
    if (updates.code) {
      const existing = await ctx.db
        .query("assessment_types")
        .filter((q) => q.eq(q.field("code"), updates.code))
        .filter((q) => q.neq(q.field("_id"), id))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .first();
      
      if (existing) {
        throw new Error("Assessment type code already exists");
      }
    }
    
    // Validate default weighting if provided
    if (updates.defaultWeighting !== undefined) {
      if (updates.defaultWeighting < 0 || updates.defaultWeighting > 100) {
        throw new Error("Default weighting must be between 0 and 100");
      }
    }
    
    // Validate default duration if provided
    if (updates.defaultDuration !== undefined) {
      if (updates.defaultDuration <= 0) {
        throw new Error("Default duration must be greater than 0");
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete an assessment type
export const remove = mutation({
  args: { id: v.id("assessment_types") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get assessment type categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const assessmentTypes = await ctx.db
      .query("assessment_types")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
    
    // Extract unique categories
    const categories = [...new Set(assessmentTypes.map(at => at.category))];
    return categories.sort();
  },
}); 