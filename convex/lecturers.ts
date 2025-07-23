import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query to get all lecturers
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("lecturers").collect();
  },
});

// Mutation to update status
export const updateStatus = mutation({
  args: { id: v.id("lecturers"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});