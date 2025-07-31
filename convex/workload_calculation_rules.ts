import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  ruleType: v.string(), // e.g., "Teaching", "Assessment", "Administration", "Custom"
  category: v.string(), // e.g., "Standard", "Premium", "Overtime", "Special"
  formula: v.string(), // Mathematical formula for calculation
  variables: v.array(v.object({
    name: v.string(),
    description: v.string(),
    type: v.string(), // e.g., "number", "boolean", "string"
    defaultValue: v.optional(v.any()),
    required: v.boolean(),
  })),
  conditions: v.optional(v.array(v.object({
    field: v.string(),
    operator: v.string(), // e.g., "equals", "greater_than", "less_than", "contains"
    value: v.any(),
    logicalOperator: v.optional(v.string()), // "AND", "OR"
  }))),
  multiplier: v.number(), // Multiplier for the calculated value
  minimumHours: v.optional(v.number()), // Minimum hours to apply
  maximumHours: v.optional(v.number()), // Maximum hours to apply
  roundingRule: v.string(), // e.g., "nearest", "up", "down", "none"
  decimalPlaces: v.number(), // Number of decimal places to round to
  isActive: v.boolean(),
  priority: v.number(), // Priority order for rule application
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all workload calculation rules
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_calculation_rules")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get workload calculation rule by ID
export const getById = query({
  args: { id: v.id("workload_calculation_rules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const rule = await ctx.db.get(args.id);
    if (!rule || rule.deletedAt) return null;
    return rule;
  },
});

// Get rules by type
export const getByType = query({
  args: { ruleType: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_calculation_rules")
      .filter((q) => q.eq(q.field("ruleType"), args.ruleType))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get rules by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_calculation_rules")
      .filter((q) => q.eq(q.field("category"), args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get active rules ordered by priority
export const getActiveRulesByPriority = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_calculation_rules")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get rules by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_calculation_rules")
      .filter((q) => q.eq(q.field("name"), args.name))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
  },
});

// Create a new workload calculation rule
export const create = mutation({
  args: {
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
    multiplier: v.number(),
    minimumHours: v.optional(v.number()),
    maximumHours: v.optional(v.number()),
    roundingRule: v.string(),
    decimalPlaces: v.number(),
    priority: v.number(),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if name already exists
    const existing = await ctx.db
      .query("workload_calculation_rules")
      .filter((q) => q.eq(q.field("name"), args.name))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Rule name already exists");
    }
    
    // Validate multiplier
    if (args.multiplier < 0) {
      throw new Error("Multiplier cannot be negative");
    }
    
    // Validate decimal places
    if (args.decimalPlaces < 0 || args.decimalPlaces > 10) {
      throw new Error("Decimal places must be between 0 and 10");
    }
    
    // Validate priority
    if (args.priority < 0) {
      throw new Error("Priority cannot be negative");
    }
    
    // Validate minimum and maximum hours if provided
    if (args.minimumHours !== undefined) {
      if (args.minimumHours < 0) {
        throw new Error("Minimum hours cannot be negative");
      }
    }
    
    if (args.maximumHours !== undefined) {
      if (args.maximumHours < 0) {
        throw new Error("Maximum hours cannot be negative");
      }
    }
    
    if (args.minimumHours !== undefined && args.maximumHours !== undefined) {
      if (args.minimumHours > args.maximumHours) {
        throw new Error("Minimum hours cannot be greater than maximum hours");
      }
    }
    
    // Validate rounding rule
    const validRoundingRules = ["nearest", "up", "down", "none"];
    if (!validRoundingRules.includes(args.roundingRule)) {
      throw new Error("Invalid rounding rule");
    }
    
    return await ctx.db.insert("workload_calculation_rules", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a workload calculation rule
export const update = mutation({
  args: {
    id: v.id("workload_calculation_rules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    ruleType: v.optional(v.string()),
    category: v.optional(v.string()),
    formula: v.optional(v.string()),
    variables: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
      type: v.string(),
      defaultValue: v.optional(v.any()),
      required: v.boolean(),
    }))),
    conditions: v.optional(v.array(v.object({
      field: v.string(),
      operator: v.string(),
      value: v.any(),
      logicalOperator: v.optional(v.string()),
    }))),
    multiplier: v.optional(v.number()),
    minimumHours: v.optional(v.number()),
    maximumHours: v.optional(v.number()),
    roundingRule: v.optional(v.string()),
    decimalPlaces: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // If updating name, check for duplicates
    if (updates.name) {
      const existing = await ctx.db
        .query("workload_calculation_rules")
        .filter((q) => q.eq(q.field("name"), updates.name))
        .filter((q) => q.neq(q.field("_id"), id))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .first();
      
      if (existing) {
        throw new Error("Rule name already exists");
      }
    }
    
    // Validate multiplier if provided
    if (updates.multiplier !== undefined) {
      if (updates.multiplier < 0) {
        throw new Error("Multiplier cannot be negative");
      }
    }
    
    // Validate decimal places if provided
    if (updates.decimalPlaces !== undefined) {
      if (updates.decimalPlaces < 0 || updates.decimalPlaces > 10) {
        throw new Error("Decimal places must be between 0 and 10");
      }
    }
    
    // Validate priority if provided
    if (updates.priority !== undefined) {
      if (updates.priority < 0) {
        throw new Error("Priority cannot be negative");
      }
    }
    
    // Validate minimum and maximum hours if provided
    if (updates.minimumHours !== undefined) {
      if (updates.minimumHours < 0) {
        throw new Error("Minimum hours cannot be negative");
      }
    }
    
    if (updates.maximumHours !== undefined) {
      if (updates.maximumHours < 0) {
        throw new Error("Maximum hours cannot be negative");
      }
    }
    
    if (updates.minimumHours !== undefined && updates.maximumHours !== undefined) {
      if (updates.minimumHours > updates.maximumHours) {
        throw new Error("Minimum hours cannot be greater than maximum hours");
      }
    }
    
    // Validate rounding rule if provided
    if (updates.roundingRule) {
      const validRoundingRules = ["nearest", "up", "down", "none"];
      if (!validRoundingRules.includes(updates.roundingRule)) {
        throw new Error("Invalid rounding rule");
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a workload calculation rule
export const remove = mutation({
  args: { id: v.id("workload_calculation_rules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get workload calculation rules with full relationship information
export const getAllWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const rules = await ctx.db
      .query("workload_calculation_rules")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
    
    return rules;
  },
}); 