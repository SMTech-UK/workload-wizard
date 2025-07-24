import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("modules").collect();
  },
});

// Query to get all module allocations
export const getAllAllocations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("module_allocations").collect();
  },
});

// Query to get module allocations by lecturerId
export const getByLecturerId = query({
  args: { lecturerId: v.id("lecturers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("module_allocations")
      .filter((q) => q.eq(q.field("lecturerId"), args.lecturerId))
      .collect();
  },
});

// Mutation to set module allocations for a lecturer
export const setForLecturer = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    moduleAllocations: v.array(
      v.object({
        moduleCode: v.string(),
        moduleName: v.string(),
        hoursAllocated: v.number(),
        type: v.string(),
        semester: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Remove existing allocations for this lecturer
    const existing = await ctx.db
      .query("module_allocations")
      .filter((q) => q.eq(q.field("lecturerId"), args.lecturerId))
      .collect();
    for (const alloc of existing) {
      await ctx.db.delete(alloc._id);
    }
    // Insert new allocations
    for (const alloc of args.moduleAllocations) {
      await ctx.db.insert("module_allocations", {
        lecturerId: args.lecturerId,
        ...alloc,
      });
    }
  },
});