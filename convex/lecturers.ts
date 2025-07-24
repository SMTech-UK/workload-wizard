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

// Mutation to create a new lecturer
export const createLecturer = mutation({
  args: {
    fullName: v.string(),
    team: v.string(),
    specialism: v.string(),
    contract: v.string(),
    email: v.string(),
    capacity: v.number(),
    maxTeachingHours: v.number(),
    role: v.string(),
    status: v.string(),
    teachingAvailability: v.number(),
    totalAllocated: v.number(),
    totalContract: v.number(),
    allocatedTeachingHours: v.number(),
    allocatedAdminHours: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lecturers", {
      ...args,
    });
  },
});

export const updateLecturer = mutation({
  args: {
    id: v.id("lecturers"),
    fullName: v.string(),
    team: v.string(),
    specialism: v.string(),
    contract: v.string(),
    email: v.string(),
    capacity: v.number(),
    maxTeachingHours: v.number(),
    role: v.string(),
    status: v.string(),
    teachingAvailability: v.number(),
    totalAllocated: v.number(),
    totalContract: v.number(),
    allocatedTeachingHours: v.number(),
    allocatedAdminHours: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const getById = query({
  args: { id: v.id("lecturers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});