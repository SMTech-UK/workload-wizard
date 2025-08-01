import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all lecturer statuses
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    let query = ctx.db.query("lecturer_statuses")
      .filter(q => q.eq(q.field("isActive"), true));
    
    if (organisation) {
      query = query.filter(q => q.eq(q.field("organisationId"), organisation._id));
    }
    
    return await query.order("asc").collect();
  },
});

// Get lecturer status by ID
export const get = query({
  args: { id: v.id("lecturer_statuses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Create a new lecturer status
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    code: v.string(),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    return await ctx.db.insert("lecturer_statuses", {
      ...args,
      isActive: args.isActive ?? true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a lecturer status
export const update = mutation({
  args: {
    id: v.id("lecturer_statuses"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    code: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updateData } = args;
    
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

// Delete a lecturer status (soft delete)
export const remove = mutation({
  args: { id: v.id("lecturer_statuses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
    
    return args.id;
  },
}); 