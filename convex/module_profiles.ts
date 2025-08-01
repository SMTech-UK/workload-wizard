import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Define the module profiles table schema
// This contains core module information that doesn't change between academic years
export default {
  code: v.string(),
  title: v.string(),
  credits: v.number(),
  level: v.number(),
  moduleLeader: v.string(),
  defaultTeachingHours: v.number(),
  defaultMarkingHours: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

// Query to get all module profiles
export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("module_profiles").collect();
  },
});

// Query to get a module profile by ID
export const getById = query({
  args: { id: v.id("module_profiles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Mutation to create a new module profile
export const createProfile = mutation({
  args: {
    code: v.string(),
    title: v.string(),
    credits: v.number(),
    level: v.number(),
    moduleLeader: v.string(),
    defaultTeachingHours: v.number(),
    defaultMarkingHours: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.insert("module_profiles", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mutation to update a module profile
export const updateProfile = mutation({
  args: {
    id: v.id("module_profiles"),
    code: v.optional(v.string()),
    title: v.optional(v.string()),
    credits: v.optional(v.number()),
    level: v.optional(v.number()),
    moduleLeader: v.optional(v.string()),
    defaultTeachingHours: v.optional(v.number()),
    defaultMarkingHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to delete a module profile
export const deleteProfile = mutation({
  args: { id: v.id("module_profiles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    await ctx.db.delete(args.id);
  },
});

// Mutation to bulk import module profiles
export const bulkImport = mutation({
  args: {
    profiles: v.array(
      v.object({
        code: v.string(),
        title: v.string(),
        credits: v.number(),
        level: v.number(),
        moduleLeader: v.string(),
        defaultTeachingHours: v.number(),
        defaultMarkingHours: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const results = [];
    for (const profileData of args.profiles) {
      try {
        const profileId = await ctx.db.insert("module_profiles", {
          ...profileData,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.push({ success: true, id: profileId, code: profileData.code });
      } catch (error) {
        results.push({ success: false, code: profileData.code, error: String(error) });
      }
    }
    return results;
  },
}); 