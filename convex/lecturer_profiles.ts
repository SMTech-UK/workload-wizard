import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Define the lecturer profiles table schema
// This contains core lecturer information that doesn't change between academic years
export default {
  fullName: v.string(),
  team: v.string(),
  specialism: v.string(),
  contract: v.string(),
  email: v.string(),
  role: v.string(),
  family: v.string(),
  fte: v.number(),
  // Core contract details that remain the same
  capacity: v.number(),
  maxTeachingHours: v.number(),
  totalContract: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

// Query to get all lecturer profiles
export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("lecturer_profiles").collect();
  },
});

// Query to get a lecturer profile by ID
export const getById = query({
  args: { id: v.id("lecturer_profiles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Mutation to create a new lecturer profile
export const createProfile = mutation({
  args: {
    fullName: v.string(),
    team: v.string(),
    specialism: v.string(),
    contract: v.string(),
    email: v.string(),
    role: v.string(),
    family: v.string(),
    fte: v.number(),
    capacity: v.number(),
    maxTeachingHours: v.number(),
    totalContract: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.insert("lecturer_profiles", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mutation to update a lecturer profile
export const updateProfile = mutation({
  args: {
    id: v.id("lecturer_profiles"),
    fullName: v.optional(v.string()),
    team: v.optional(v.string()),
    specialism: v.optional(v.string()),
    contract: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    family: v.optional(v.string()),
    fte: v.optional(v.number()),
    capacity: v.optional(v.number()),
    maxTeachingHours: v.optional(v.number()),
    totalContract: v.optional(v.number()),
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

// Mutation to delete a lecturer profile
export const deleteProfile = mutation({
  args: { id: v.id("lecturer_profiles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    await ctx.db.delete(args.id);
  },
});

// Mutation to bulk import lecturer profiles
export const bulkImport = mutation({
  args: {
    profiles: v.array(
      v.object({
        fullName: v.string(),
        team: v.string(),
        specialism: v.string(),
        contract: v.string(),
        email: v.string(),
        role: v.string(),
        family: v.optional(v.string()),
        fte: v.optional(v.number()),
        capacity: v.number(),
        maxTeachingHours: v.number(),
        totalContract: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const results = [];
    for (const profileData of args.profiles) {
      try {
        const dataToInsert = {
          ...profileData,
          family: profileData.family || "",
          fte: profileData.fte || 1.0,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        const profileId = await ctx.db.insert("lecturer_profiles", dataToInsert);
        results.push({ success: true, id: profileId, email: profileData.email });
      } catch (error) {
        results.push({ success: false, email: profileData.email, error: String(error) });
      }
    }
    return results;
  },
}); 