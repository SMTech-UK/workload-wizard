import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Notification schema fields:
// type, title, description, timestamp, priority, relatedUser, relatedModule, actionRequired, isRead, isArchived

export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('notifications')
      .filter((q) => q.eq(q.field('isArchived'), false))
      .order('desc')
      .collect();
  },
});

export const markNotificationAsRead = mutation({
  args: { id: v.id('notifications') },
  handler: async (ctx, args) => {
    const { id } = args;
    await ctx.db.patch(id, { isRead: true });
  },
});

export const markAllNotificationsAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const unreadNotifications = await ctx.db
      .query('notifications')
      .filter((q) => q.eq(q.field('isRead'), false))
      .filter((q) => q.eq(q.field('isArchived'), false))
      .order('desc')
      .collect();

    if (unreadNotifications.length > 0) {
      for (const notification of unreadNotifications) {
        await ctx.db.patch(notification._id, { isRead: true });
      }
    }
  },
});

export const archiveNotification = mutation({
  args: { id: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isArchived: true });
  },
});

export const createNotification = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.string(),
    timestamp: v.string(),
    priority: v.string(),
    relatedUser: v.optional(v.string()),
    relatedModule: v.optional(v.string()),
    actionRequired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('notifications', {
      type: args.type,
      title: args.title,
      description: args.description,
      timestamp: args.timestamp,
      priority: args.priority,
      relatedUser: args.relatedUser,
      relatedModule: args.relatedModule,
      actionRequired: args.actionRequired ?? false,
      isRead: false,
      isArchived: false,
    });
  },
});

export const markNotificationAsUnread = mutation({
  args: { id: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: false });
  },
});