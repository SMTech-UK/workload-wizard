import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all allocation types (alias for getAll)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get all allocation types
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get allocation type by ID
export const getById = query({
  args: { id: v.id("allocation_types") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const allocationType = await ctx.db.get(args.id);
    if (!allocationType || allocationType.deletedAt) return null;
    return allocationType;
  },
});

// Get allocation types by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("category"), args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get allocation type by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
  },
});

// Get teaching allocation types
export const getTeachingTypes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("isTeaching"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get assessment allocation types
export const getAssessmentTypes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("isAssessment"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get administrative allocation types
export const getAdministrativeTypes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("isAdministrative"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get allocation types that require rooms
export const getRoomRequiredTypes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("requiresRoom"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Create a new allocation type
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    defaultHours: v.optional(v.number()),
    defaultStudents: v.optional(v.number()),
    isTeaching: v.optional(v.boolean()),
    isAssessment: v.optional(v.boolean()),
    isAdministrative: v.optional(v.boolean()),
    requiresRoom: v.optional(v.boolean()),
    canBeGrouped: v.optional(v.boolean()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if code already exists
    const existing = await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Allocation type code already exists");
    }
    
    // Validate default hours if provided
    if (args.defaultHours !== undefined) {
      if (args.defaultHours <= 0) {
        throw new Error("Default hours must be greater than 0");
      }
    }
    
    // Validate default students if provided
    if (args.defaultStudents !== undefined) {
      if (args.defaultStudents < 0) {
        throw new Error("Default students cannot be negative");
      }
    }
    
    return await ctx.db.insert("allocation_types", {
      ...args,
      isTeaching: args.isTeaching ?? false,
      isAssessment: args.isAssessment ?? false,
      isAdministrative: args.isAdministrative ?? false,
      requiresRoom: args.requiresRoom ?? false,
      canBeGrouped: args.canBeGrouped ?? true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update an allocation type
export const update = mutation({
  args: {
    id: v.id("allocation_types"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    defaultHours: v.optional(v.number()),
    defaultStudents: v.optional(v.number()),
    isTeaching: v.optional(v.boolean()),
    isAssessment: v.optional(v.boolean()),
    isAdministrative: v.optional(v.boolean()),
    requiresRoom: v.optional(v.boolean()),
    canBeGrouped: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // If updating code, check for duplicates
    if (updates.code) {
      const existing = await ctx.db
        .query("allocation_types")
        .filter((q) => q.eq(q.field("code"), updates.code))
        .filter((q) => q.neq(q.field("_id"), id))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .first();
      
      if (existing) {
        throw new Error("Allocation type code already exists");
      }
    }
    
    // Validate default hours if provided
    if (updates.defaultHours !== undefined) {
      if (updates.defaultHours <= 0) {
        throw new Error("Default hours must be greater than 0");
      }
    }
    
    // Validate default students if provided
    if (updates.defaultStudents !== undefined) {
      if (updates.defaultStudents < 0) {
        throw new Error("Default students cannot be negative");
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete an allocation type
export const remove = mutation({
  args: { id: v.id("allocation_types") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get allocation type categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const allocationTypes = await ctx.db
      .query("allocation_types")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
    
    // Extract unique categories
    const categories = [...new Set(allocationTypes.map(at => at.category))];
    return categories.sort();
  },
}); 