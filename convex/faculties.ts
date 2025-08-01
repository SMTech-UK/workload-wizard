import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all faculties (alias for getAll)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("faculties")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get all faculties
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("faculties")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get faculty by ID
export const getById = query({
  args: { id: v.id("faculties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const faculty = await ctx.db.get(args.id);
    if (!faculty || faculty.deletedAt) return null;
    return faculty;
  },
});

// Get faculty by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("faculties")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
  },
});

// Create a new faculty
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    deanId: v.optional(v.id("user_profiles")),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if code already exists
    const existing = await ctx.db
      .query("faculties")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Faculty code already exists");
    }
    
    return await ctx.db.insert("faculties", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a faculty
export const update = mutation({
  args: {
    id: v.id("faculties"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    deanId: v.optional(v.id("user_profiles")),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // If updating code, check for duplicates
    if (updates.code) {
      const existing = await ctx.db
        .query("faculties")
        .filter((q) => q.eq(q.field("code"), updates.code))
        .filter((q) => q.neq(q.field("_id"), id))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .first();
      
      if (existing) {
        throw new Error("Faculty code already exists");
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a faculty
export const remove = mutation({
  args: { id: v.id("faculties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get faculty with dean information
export const getByIdWithDean = query({
  args: { id: v.id("faculties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const faculty = await ctx.db.get(args.id);
    if (!faculty || faculty.deletedAt) return null;
    
    let dean = null;
    if (faculty.deanId) {
      dean = await ctx.db.get(faculty.deanId);
    }
    
    return {
      ...faculty,
      dean,
    };
  },
});

// Get all faculties with dean information
export const getAllWithDean = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const faculties = await ctx.db
      .query("faculties")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
    
    // Fetch dean information for each faculty
    const facultiesWithDean = await Promise.all(
      faculties.map(async (faculty) => {
        let dean = null;
        if (faculty.deanId) {
          dean = await ctx.db.get(faculty.deanId);
        }
        
        return {
          ...faculty,
          dean,
        };
      })
    );
    
    return facultiesWithDean;
  },
}); 