import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  name: v.string(),
  domain: v.optional(v.string()),
  standardClassSize: v.optional(v.number()),
  academicYear: v.optional(v.string()),
  currentSemester: v.optional(v.string()),
  settings: v.optional(v.object({
    enableModuleAllocations: v.optional(v.boolean()),
    enableWorkloadTracking: v.optional(v.boolean()),
    enableNotifications: v.optional(v.boolean()),
    requireAdminApproval: v.optional(v.boolean()),
    auditTrail: v.optional(v.boolean()),
  })),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// Get the current organisation settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const organisation = await ctx.db.query("organisations").first();
    return organisation;
  },
});

// Update organisation settings
export const update = mutation({
  args: {
    standardClassSize: v.optional(v.number()),
    academicYear: v.optional(v.string()),
    currentSemester: v.optional(v.string()),
    settings: v.optional(v.object({
      enableModuleAllocations: v.optional(v.boolean()),
      enableWorkloadTracking: v.optional(v.boolean()),
      enableNotifications: v.optional(v.boolean()),
      requireAdminApproval: v.optional(v.boolean()),
      auditTrail: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const organisation = await ctx.db.query("organisations").first();
    
    if (organisation) {
      // Update existing organisation
      return await ctx.db.patch(organisation._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      // Create new organisation if none exists
      return await ctx.db.insert("organisations", {
        name: "Default Organisation",
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Update standard class size specifically
export const updateStandardClassSize = mutation({
  args: {
    standardClassSize: v.number(),
  },
  handler: async (ctx, args) => {
    const organisation = await ctx.db.query("organisations").first();
    
    if (organisation) {
      return await ctx.db.patch(organisation._id, {
        standardClassSize: args.standardClassSize,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("organisations", {
        name: "Default Organisation",
        standardClassSize: args.standardClassSize,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
}); 