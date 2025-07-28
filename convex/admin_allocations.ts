import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import Calculator from "@/lib/calculator";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admin_allocations").collect();
  },
});

export const setForLecturer = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    adminAllocations: v.array(v.object({
      category: v.string(),
      description: v.string(),
      hours: v.number(),
      isHeader: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    // Try to find existing allocation for this lecturer (no index)
    const all = await ctx.db.query("admin_allocations").collect();
    const existing = all.find(a => a.lecturerId === args.lecturerId);
    if (existing) {
      await ctx.db.patch(existing._id, { adminAllocations: args.adminAllocations });
    } else {
      await ctx.db.insert("admin_allocations", {
        lecturerId: args.lecturerId,
        adminAllocations: args.adminAllocations,
      });
    }
    // Update allocatedAdminHours in lecturers table
    // Sum all hours from adminAllocations
    const totalAdminHours = args.adminAllocations
      .filter(a => !a.isHeader)
      .reduce((sum, a) => sum + a.hours, 0);
    // Find the lecturer by id and update allocatedAdminHours
    const lecturers = await ctx.db.query("lecturers").collect();
    const lecturer = lecturers.find(l => l._id === args.lecturerId);
    if (lecturer) {
      await ctx.db.patch(lecturer._id, { allocatedAdminHours: totalAdminHours });
      // Calculate and update capacity (remaining hours)
      const totalAllocated = (lecturer.allocatedTeachingHours || 0) + totalAdminHours;
      const newCapacity = lecturer.totalContract ? lecturer.totalContract - totalAllocated : 0;
      await ctx.db.patch(lecturer._id, { capacity: newCapacity });
      // Update totalAllocated live
      await ctx.db.patch(lecturer._id, { totalAllocated });
    }
  },
});