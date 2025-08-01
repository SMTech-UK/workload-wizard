import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all user roles
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    let query = ctx.db.query("user_roles");
    
    if (organisation) {
      query = query.filter(q => q.eq(q.field("organisationId"), organisation._id));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.order("asc").collect();
  },
});

// Get user role by ID
export const get = query({
  args: { id: v.id("user_roles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Create a new user role
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string()),
    isSystem: v.optional(v.boolean()),
    organisationId: v.optional(v.id("organisations")),
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
    
    return await ctx.db.insert("user_roles", {
      ...args,
      isSystem: args.isSystem ?? false,
      isActive: true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a user role
export const update = mutation({
  args: {
    id: v.id("user_roles"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
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

// Delete a user role (soft delete)
export const remove = mutation({
  args: { id: v.id("user_roles") },
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

// Export remove as delete for compatibility
export const delete_ = remove;

// Get system roles
export const getSystemRoles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    let query = ctx.db.query("user_roles")
      .filter(q => q.eq(q.field("isSystem"), true))
      .filter(q => q.eq(q.field("isActive"), true));
    
    if (organisation) {
      query = query.filter(q => q.eq(q.field("organisationId"), organisation._id));
    }
    
    return await query.order("asc").collect();
  },
}); 