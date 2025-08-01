import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get notification settings for a user
export const getNotificationSettings = query({
  args: { userId: v.string() },
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
    
    const settings = await ctx.db.query("notification_settings")
      .filter(q => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    return settings;
  },
});

// Update notification settings
export const updateNotificationSettings = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    email: v.optional(v.boolean()),
    inApp: v.optional(v.boolean()),
    push: v.optional(v.boolean()),
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
    
    const { userId, ...updates } = args;
    
    // Check if settings exist
    const existingSettings = await ctx.db.query("notification_settings")
      .filter(q => 
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingSettings) {
      // Update existing settings
      await ctx.db.patch(existingSettings._id, {
        ...updates,
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "update",
        entityType: "notification_settings",
        entityId: existingSettings._id,
        changes: updates,
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        organisationId: organisation._id,
        createdAt: Date.now(),
      });
      
      return existingSettings._id;
    } else {
      // Create new settings
      const settingsId = await ctx.db.insert("notification_settings", {
        userId,
        type: updates.type,
        email: updates.email ?? true,
        inApp: updates.inApp ?? true,
        push: updates.push ?? true,
        isActive: updates.isActive ?? true,
        organisationId: organisation._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "create",
        entityType: "notification_settings",
        entityId: settingsId,
        changes: { userId, ...updates },
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        organisationId: organisation._id,
        createdAt: Date.now(),
      });
      
      return settingsId;
    }
  },
});

// Get all notification settings for the organisation
export const getAllNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    return await ctx.db.query("notification_settings")
      .filter(q => q.eq(q.field("organisationId"), organisation._id))
      .collect();
  },
});

// Get external system configurations
export const getExternalSystems = query({
  args: {
    type: v.optional(v.string()),
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
    
    let query = ctx.db.query("external_systems")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.type) {
      query = query.filter(q => q.eq(q.field("type"), args.type));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Create external system configuration
export const createExternalSystem = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    config: v.any(),
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
    
    const systemId = await ctx.db.insert("external_systems", {
      ...args,
      isActive: args.isActive ?? true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "external_systems",
      entityId: systemId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return systemId;
  },
});

// Update external system configuration
export const updateExternalSystem = mutation({
  args: {
    id: v.id("external_systems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    configuration: v.optional(v.any()),
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
    
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "external_systems",
      entityId: id,
      changes: updates,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return id;
  },
});

// Get data sync logs
export const getDataSyncLogs = query({
  args: {
    externalSystemId: v.optional(v.id("external_systems")),
    status: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
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
    
    let query = ctx.db.query("data_sync_logs")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.externalSystemId) {
      query = query.filter(q => q.eq(q.field("externalSystemId"), args.externalSystemId));
    }
    
    if (args.status) {
      query = query.filter(q => q.eq(q.field("status"), args.status));
    }
    
    if (args.startDate !== undefined) {
      query = query.filter(q => q.gte(q.field("createdAt"), args.startDate!));
    }
    
    if (args.endDate !== undefined) {
      query = query.filter(q => q.lte(q.field("createdAt"), args.endDate!));
    }
    
    // Order by creation date (newest first)
    if (args.limit) {
      return await query.order("desc").take(args.limit);
    }
    
    return await query.order("desc").collect();
  },
});

// Create data sync log
export const createDataSyncLog = mutation({
  args: {
    externalSystemId: v.id("external_systems"),
    operation: v.string(),
    status: v.string(),
    details: v.optional(v.any()),
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
    
    const logId = await ctx.db.insert("data_sync_logs", {
      externalSystemId: args.externalSystemId,
      operation: args.operation,
      status: args.status,
      details: args.details,
      organisationId: organisation._id,
      startedAt: Date.now(),
      createdAt: Date.now(),
    });
    
    return logId;
  },
});

// Get notification summary
export const getNotificationSummary = query({
  args: {
    userId: v.optional(v.string()),
    days: v.optional(v.number()),
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
    
    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    // Get notification settings
    let settingsQuery = ctx.db.query("notification_settings")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.userId) {
      settingsQuery = settingsQuery.filter(q => q.eq(q.field("userId"), args.userId));
    }
    
    const settings = await settingsQuery.collect();
    
    // Get external systems
    const externalSystems = await ctx.db.query("external_systems")
      .filter(q => 
        q.and(
          q.eq(q.field("organisationId"), organisation._id),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
    
    // Get recent sync logs
    const syncLogs = await ctx.db.query("data_sync_logs")
      .filter(q => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .order("desc")
      .take(10);
    
    // Calculate summary statistics
    const totalSettings = settings.length;
    const activeSettings = settings.filter(s => s.isActive).length;
    const emailEnabled = settings.filter(s => s.email).length;
    const pushEnabled = settings.filter(s => s.push).length;
    const inAppEnabled = settings.filter(s => s.inApp).length;
    
    const totalSystems = externalSystems.length;
    const activeSystems = externalSystems.filter(s => s.isActive).length;
    
    const totalSyncs = syncLogs.length;
    const successfulSyncs = syncLogs.filter(log => log.status === "success").length;
    const failedSyncs = syncLogs.filter(log => log.status === "failed").length;
    
    return {
      settings: {
        total: totalSettings,
        active: activeSettings,
        emailEnabled,
        pushEnabled,
        inAppEnabled,
      },
      systems: {
        total: totalSystems,
        active: activeSystems,
      },
      syncs: {
        total: totalSyncs,
        successful: successfulSyncs,
        failed: failedSyncs,
        successRate: totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0,
      },
      recentLogs: syncLogs,
    };
  },
}); 