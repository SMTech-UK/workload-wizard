import { v } from "convex/values";
import { query, mutation } from "./_generated/server";



// Get user settings by user ID
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("user_settings")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
  },
});

// Create or update user settings
export const set = mutation({
  args: {
    userId: v.string(),
    theme: v.optional(v.string()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    dashboard: v.optional(v.object({
      defaultView: v.string(),
      showNotifications: v.boolean(),
      showRecentActivity: v.boolean(),
    })),
    notifications: v.optional(v.object({
      email: v.boolean(),
      inApp: v.boolean(),
      push: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const existing = await ctx.db
      .query("user_settings")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("user_settings", {
        ...args,
        theme: args.theme ?? "system",
        language: args.language ?? "en",
        timezone: args.timezone ?? "UTC",
        dateFormat: args.dateFormat ?? "DD/MM/YYYY",
        timeFormat: args.timeFormat ?? "24h",
        dashboard: args.dashboard ?? {
          defaultView: "overview",
          showNotifications: true,
          showRecentActivity: true,
        },
        notifications: args.notifications ?? {
          email: true,
          inApp: true,
          push: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Update specific setting
export const updateSetting = mutation({
  args: {
    userId: v.string(),
    setting: v.string(), // "theme", "language", "notifications", etc.
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const existing = await ctx.db
      .query("user_settings")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (existing) {
      return await ctx.db.patch(existing._id, {
        [args.setting]: args.value,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("user_settings", {
        userId: args.userId,
        theme: "system",
        language: "en",
        timezone: "UTC",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        dashboard: {
          defaultView: "overview",
          showNotifications: true,
          showRecentActivity: true,
        },
        notifications: {
          email: true,
          inApp: true,
          push: true,
        },
        [args.setting]: args.value,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Reset user settings to defaults
export const resetToDefaults = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const defaults = {
      theme: "system",
      language: "en",
      timezone: "UTC",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      notifications: {
        email: true,
        inApp: true,
        push: true,
      },
      dashboard: {
        defaultView: "overview",
        showNotifications: true,
        showRecentActivity: true,
      },
    };
    
    const existing = await ctx.db
      .query("user_settings")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...defaults,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("user_settings", {
        userId: args.userId,
        ...defaults,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Delete user settings
export const remove = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const existing = await ctx.db
      .query("user_settings")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (existing) {
      return await ctx.db.delete(existing._id);
    }
    
    return null;
  },
}); 