import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  userId: v.string(), // Clerk user ID
  key: v.string(), // Preference key
  value: v.any(), // Preference value (can be any type)
  category: v.string(), // e.g., "ui", "workflow", "notifications"
  isSystem: v.boolean(), // Whether this is a system preference
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// If you want to display descriptions for user preferences in the UI,
// use a frontend-side lookup/config, not a DB field. The DB schema does not support a description column.

// Get all preferences for a user
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("user_preferences")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("asc")
      .collect();
  },
});

// Get preferences by category
export const getByCategory = query({
  args: { 
    userId: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("user_preferences")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("category"), args.category))
      .order("asc")
      .collect();
  },
});

// Get a specific preference
export const getByKey = query({
  args: { 
    userId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("user_preferences")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
  },
});

// Set a preference (create or update)
export const set = mutation({
  args: {
    userId: v.string(),
    key: v.string(),
    value: v.any(),
    category: v.string(),
    isSystem: v.optional(v.boolean()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const existing = await ctx.db
      .query("user_preferences")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
    
    if (existing) {
      return await ctx.db.patch(existing._id, {
        value: args.value,
        category: args.category,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("user_preferences", {
        ...args,
        isSystem: args.isSystem ?? false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Delete a preference
export const remove = mutation({
  args: { 
    userId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const existing = await ctx.db
      .query("user_preferences")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
    
    if (existing && !existing.isSystem) {
      return await ctx.db.delete(existing._id);
    }
    
    throw new Error("Preference not found or is a system preference");
  },
});

// Set multiple preferences at once
export const setMultiple = mutation({
  args: {
    userId: v.string(),
    preferences: v.array(v.object({
      key: v.string(),
      value: v.any(),
      category: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const results = [];
    
    for (const pref of args.preferences) {
      const existing = await ctx.db
        .query("user_preferences")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .filter((q) => q.eq(q.field("key"), pref.key))
        .first();
      
      if (existing) {
        const result = await ctx.db.patch(existing._id, {
          value: pref.value,
          category: pref.category,
          updatedAt: Date.now(),
        });
        results.push(result);
      } else {
        const result = await ctx.db.insert("user_preferences", {
          userId: args.userId,
          ...pref,
          isSystem: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.push(result);
      }
    }
    
    return results;
  },
});

// Reset user preferences to defaults
export const resetToDefaults = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Delete all non-system preferences
    const userPrefs = await ctx.db
      .query("user_preferences")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("isSystem"), false))
      .collect();
    
    for (const pref of userPrefs) {
      await ctx.db.delete(pref._id);
    }
    
    // Create default preferences
    const defaults = [
      { key: "dashboard_layout", value: "grid", category: "ui" },
      { key: "table_page_size", value: 25, category: "ui" },
      { key: "show_help_tooltips", value: true, category: "ui" },
      { key: "auto_save_forms", value: true, category: "workflow" },
      { key: "confirm_deletions", value: true, category: "workflow" },
    ];
    
    const results = [];
    for (const defaultPref of defaults) {
      const result = await ctx.db.insert("user_preferences", {
        userId: args.userId,
        ...defaultPref,
        isSystem: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.push(result);
    }
    
    return results;
  },
}); 