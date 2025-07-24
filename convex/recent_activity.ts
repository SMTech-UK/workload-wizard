import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recent_activity").collect();
  },
});

export const logActivity = mutation({
  args: {
    action: v.string(),
    changeType: v.string(),
    entity: v.string(),
    entityId: v.string(),
    modifiedBy: v.array(v.object({ name: v.string(), email: v.string() })),
    timestamp: v.string(),
    permission: v.string(),
    formatted: v.string(),
    type: v.optional(v.string()),
    details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("recent_activity", {
      action: args.action,
      changeType: args.changeType,
      entity: args.entity,
      entityId: args.entityId,
      modifiedBy: args.modifiedBy,
      timestamp: args.timestamp,
      permission: args.permission,
      formatted: args.formatted,
      type: args.type,
      details: args.details,
    });
  },
});