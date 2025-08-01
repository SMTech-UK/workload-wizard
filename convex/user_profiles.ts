import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all user profiles
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

// Get user profile by ID
export const getById = query({
  args: { id: v.id("user_profiles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const profile = await ctx.db.get(args.id);
    if (!profile) return null;
    return profile;
  },
});

// Get user profile by Clerk user ID
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
  },
});

// Get user profile by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

// Create a new user profile
export const create = mutation({
  args: {
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    jobTitle: v.optional(v.string()),
    team: v.optional(v.string()),
    specialism: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.insert("user_profiles", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a user profile
export const update = mutation({
  args: {
    id: v.id("user_profiles"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    team: v.optional(v.string()),
    specialism: v.optional(v.string()),
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

// Delete a user profile (soft delete by setting isActive to false)
export const remove = mutation({
  args: { id: v.id("user_profiles") },
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

// Get user profiles by organisation
export const getByOrganisation = query({
  args: { organisationId: v.id("organisations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("organisationId"), args.organisationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

// Get active user profiles
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

// Search user profiles
export const search = query({
  args: { 
    query: v.string(),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    let profilesQuery = ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("isActive"), true));
    
    if (args.organisationId) {
      profilesQuery = profilesQuery.filter((q) => q.eq(q.field("organisationId"), args.organisationId));
    }
    
    const profiles = await profilesQuery.collect();
    
    // Simple search implementation - in a real app you'd use a proper search index
    const searchTerm = args.query.toLowerCase();
    return profiles.filter(profile => 
      profile.firstName.toLowerCase().includes(searchTerm) ||
      profile.lastName.toLowerCase().includes(searchTerm) ||
      profile.email.toLowerCase().includes(searchTerm) ||
      (profile.jobTitle && profile.jobTitle.toLowerCase().includes(searchTerm)) ||
      (profile.team && profile.team.toLowerCase().includes(searchTerm))
    );
  },
}); 