import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get the current organisation settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    return organisation;
  },
});

// Get organisation by ID
export const getById = query({
  args: { id: v.id("organisations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Update organisation settings
export const update = mutation({
  args: {
    id: v.optional(v.id("organisations")),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    domain: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      postalCode: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
    standardClassSize: v.optional(v.number()),
    defaultTeachingHours: v.optional(v.number()),
    defaultMarkingHours: v.optional(v.number()),
    defaultAdminHours: v.optional(v.number()),
    currentAcademicYearId: v.optional(v.id("academic_years")),
    currentSemesterPeriodId: v.optional(v.id("semester_periods")),
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
    currency: v.optional(v.string()),
    enableModuleAllocations: v.optional(v.boolean()),
    enableWorkloadTracking: v.optional(v.boolean()),
    enableNotifications: v.optional(v.boolean()),
    requireAdminApproval: v.optional(v.boolean()),
    enableAuditTrail: v.optional(v.boolean()),
    enableAdvancedReporting: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    if (args.id) {
      // Update existing organisation
      const organisation = await ctx.db.get(args.id);
      if (!organisation) throw new Error("Organisation not found");
      
      const { id, ...updateData } = args;
      const updatedOrg = await ctx.db.patch(args.id, {
        ...updateData,
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "update",
        entityType: "organisations",
        entityId: args.id,
        changes: updateData,
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        createdAt: Date.now(),
      });
      
      return updatedOrg;
    } else {
      // Create new organisation if none exists
      const existingOrg = await ctx.db.query("organisations")
        .filter(q => q.eq(q.field("isActive"), true))
        .first();
      
      if (existingOrg) {
        throw new Error("An organisation already exists");
      }
      
      const newOrg = await ctx.db.insert("organisations", {
        name: args.name || "Default Organisation",
        isActive: true,
        status: "active",
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "create",
        entityType: "organisations",
        entityId: newOrg,
        changes: args,
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        createdAt: Date.now(),
      });
      
      return newOrg;
    }
  },
});

// Update standard class size specifically
export const updateStandardClassSize = mutation({
  args: {
    standardClassSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    if (args.standardClassSize <= 0) {
      throw new Error("Standard class size must be greater than 0");
    }
    
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (organisation) {
      const updatedOrg = await ctx.db.patch(organisation._id, {
        standardClassSize: args.standardClassSize,
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "update",
        entityType: "organisations",
        entityId: organisation._id,
        changes: { standardClassSize: args.standardClassSize },
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        createdAt: Date.now(),
      });
      
      return updatedOrg;
    } else {
      const newOrg = await ctx.db.insert("organisations", {
        name: "Default Organisation",
        standardClassSize: args.standardClassSize,
        isActive: true,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "create",
        entityType: "organisations",
        entityId: newOrg,
        changes: { standardClassSize: args.standardClassSize },
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        createdAt: Date.now(),
      });
      
      return newOrg;
    }
  },
});

// Update default teaching hours specifically
export const updateDefaultTeachingHours = mutation({
  args: {
    defaultTeachingHours: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    if (args.defaultTeachingHours < 0) {
      throw new Error("Default teaching hours cannot be negative");
    }
    
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (organisation) {
      const updatedOrg = await ctx.db.patch(organisation._id, {
        defaultTeachingHours: args.defaultTeachingHours,
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "update",
        entityType: "organisations",
        entityId: organisation._id,
        changes: { defaultTeachingHours: args.defaultTeachingHours },
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        createdAt: Date.now(),
      });
      
      return updatedOrg;
    } else {
      const newOrg = await ctx.db.insert("organisations", {
        name: "Default Organisation",
        defaultTeachingHours: args.defaultTeachingHours,
        isActive: true,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "create",
        entityType: "organisations",
        entityId: newOrg,
        changes: { defaultTeachingHours: args.defaultTeachingHours },
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        createdAt: Date.now(),
      });
      
      return newOrg;
    }
  },
});

// Get organisation settings
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) return null;
    
    // Get organisation settings from the organisation_settings table
    const settings = await ctx.db.query("organisation_settings")
      .filter(q => q.eq(q.field("organisationId"), organisation._id))
      .collect();
    
    const settingsMap: Record<string, any> = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });
    
    return {
      ...organisation,
      settings: settingsMap,
    };
  },
});

// Update organisation settings
export const updateSettings = mutation({
  args: {
    settings: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) throw new Error("No organisation found");
    
    // Update or create settings
    for (const [key, value] of Object.entries(args.settings)) {
      let existingSetting = await ctx.db.query("organisation_settings")
        .filter(q => 
          q.and(
            q.eq(q.field("organisationId"), organisation._id),
            q.eq(q.field("key"), key)
          )
        )
        .unique();
      
      if (existingSetting) {
        await ctx.db.patch(existingSetting._id, {
          value,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("organisation_settings", {
          organisationId: organisation._id,
          key,
          value,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "organisation_settings",
      entityId: organisation._id,
      changes: args.settings,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      createdAt: Date.now(),
    });
    
    return true;
  },
}); 