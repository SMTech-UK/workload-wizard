import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  userId: v.string(), // Clerk user ID
  theme: v.optional(v.string()), // "light", "dark", "system"
  language: v.optional(v.string()), // "en", "es", etc.
  timezone: v.optional(v.string()), // "UTC", "Europe/London", etc.
  dateFormat: v.optional(v.string()), // "DD/MM/YYYY", "MM/DD/YYYY", etc.
  timeFormat: v.optional(v.string()), // "12h", "24h"
  notifications: v.optional(v.object({
    email: v.boolean(),
    push: v.boolean(),
    sms: v.boolean(),
    workloadAlerts: v.boolean(),
    allocationUpdates: v.boolean(),
    systemUpdates: v.boolean(),
  })),
  dashboard: v.optional(v.object({
    defaultView: v.string(), // "overview", "allocations", "reports"
    showWelcomeMessage: v.boolean(),
    autoRefresh: v.boolean(),
    refreshInterval: v.number(), // in seconds
  })),
  academicYear: v.optional(v.object({
    defaultView: v.optional(v.id("academic_years")),
    showStagingData: v.boolean(),
  })),
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
});

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
export const upsert = mutation({
  args: {
    userId: v.string(),
    theme: v.optional(v.string()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    notifications: v.optional(v.object({
      email: v.boolean(),
      push: v.boolean(),
      sms: v.boolean(),
      workloadAlerts: v.boolean(),
      allocationUpdates: v.boolean(),
      systemUpdates: v.boolean(),
    })),
    dashboard: v.optional(v.object({
      defaultView: v.string(),
      showWelcomeMessage: v.boolean(),
      autoRefresh: v.boolean(),
      refreshInterval: v.number(),
    })),
    academicYear: v.optional(v.object({
      defaultView: v.optional(v.id("academic_years")),
      showStagingData: v.boolean(),
    })),
    organisationId: v.optional(v.id("organisations")),
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
        push: true,
        sms: false,
        workloadAlerts: true,
        allocationUpdates: true,
        systemUpdates: false,
      },
      dashboard: {
        defaultView: "overview",
        showWelcomeMessage: true,
        autoRefresh: true,
        refreshInterval: 300, // 5 minutes
      },
      academicYear: {
        showStagingData: false,
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