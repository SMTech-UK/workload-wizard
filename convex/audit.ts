import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get audit logs with filtering
export const getAuditLogs = query({
  args: {
    userId: v.optional(v.string()),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    action: v.optional(v.string()),
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
    
    let query = ctx.db.query("audit_logs")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.userId) {
      query = query.filter(q => q.eq(q.field("userId"), args.userId));
    }
    
    if (args.entityType) {
      query = query.filter(q => q.eq(q.field("entityType"), args.entityType));
    }
    
    if (args.entityId) {
      query = query.filter(q => q.eq(q.field("entityId"), args.entityId));
    }
    
    if (args.action) {
      query = query.filter(q => q.eq(q.field("action"), args.action));
    }
    
    if (args.startDate !== undefined) {
      query = query.filter(q => q.gte(q.field("createdAt"), args.startDate!));
    }
    
    if (args.endDate !== undefined) {
      query = query.filter(q => q.lte(q.field("createdAt"), args.endDate!));
    }
    
    // Apply limit if specified
    if (args.limit) {
      return await query.order("desc").take(args.limit);
    }
    
    return await query.order("desc").collect();
  },
});

// Get audit log by ID
export const getAuditLogById = query({
  args: { id: v.id("audit_logs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Get audit logs for a specific entity
export const getAuditLogsForEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
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
    
    let query = ctx.db.query("audit_logs")
      .filter(q => 
        q.and(
          q.eq(q.field("entityType"), args.entityType),
          q.eq(q.field("entityId"), args.entityId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    
    return await query.collect();
  },
});

// Get audit logs for a specific user
export const getAuditLogsForUser = query({
  args: {
    userId: v.string(),
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
    
    let query = ctx.db.query("audit_logs")
      .filter(q => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    
    return await query.collect();
  },
});

// Get audit logs by action type
export const getAuditLogsByAction = query({
  args: {
    action: v.string(),
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
    
    let query = ctx.db.query("audit_logs")
      .filter(q => 
        q.and(
          q.eq(q.field("action"), args.action),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    
    return await query.collect();
  },
});

// Get audit logs by date range
export const getAuditLogsByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
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
    
    let query = ctx.db.query("audit_logs")
      .filter(q => 
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    
    return await query.collect();
  },
});

// Get audit summary statistics
export const getAuditSummary = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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
    
    let query = ctx.db.query("audit_logs")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.startDate !== undefined) {
      query = query.filter(q => q.gte(q.field("createdAt"), args.startDate!));
    }
    
    if (args.endDate !== undefined) {
      query = query.filter(q => q.lte(q.field("createdAt"), args.endDate!));
    }
    
    const logs = await query.collect();
    
    // Calculate summary statistics
    const summary = {
      totalLogs: logs.length,
      byAction: {} as Record<string, number>,
      byEntityType: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      recentActivity: logs.slice(0, 10), // Last 10 activities
    };
    
    // Group by action
    logs.forEach(log => {
      summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;
    });
    
    // Group by entity type
    logs.forEach(log => {
      summary.byEntityType[log.entityType] = (summary.byEntityType[log.entityType] || 0) + 1;
    });
    
    // Group by user
    logs.forEach(log => {
      summary.byUser[log.userId] = (summary.byUser[log.userId] || 0) + 1;
    });
    
    return summary;
  },
});

// Create audit log entry (for internal use)
export const createAuditLog = mutation({
  args: {
    userId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
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
    
    const auditLogId = await ctx.db.insert("audit_logs", {
      userId: args.userId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      changes: args.changes,
      ipAddress: args.ipAddress || "unknown",
      userAgent: args.userAgent || "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return auditLogId;
  },
});

// Get recent activity
export const getRecentActivity = query({
  args: {
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
    
    let query = ctx.db.query("audit_logs")
      .filter(q => q.eq(q.field("organisationId"), organisation._id))
      .order("desc");
    
    const limit = args.limit || 20;
    return await query.take(limit);
  },
});

// Get audit logs for dashboard
export const getDashboardAuditLogs = query({
  args: {
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
    
    const days = args.days || 7;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let query = ctx.db.query("audit_logs")
      .filter(q => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .order("desc");
    
    return await query.take(50); // Limit to 50 most recent entries
  },
}); 