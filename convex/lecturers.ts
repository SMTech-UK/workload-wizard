import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query to get all lecturers
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("lecturers").collect();
  },
});

// Mutation to update status
export const updateStatus = mutation({
  args: { id: v.id("lecturers"), status: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
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
    family: v.string(),
    fte: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
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
    family: v.string(),
    fte: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const getById = query({
  args: { id: v.id("lecturers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// NEW: Delete lecturer mutation
export const deleteLecturer = mutation({
  args: { id: v.id("lecturers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    await ctx.db.delete(args.id);
  },
});

// Mutation to bulk import lecturers
export const bulkImport = mutation({
  args: {
    lecturers: v.array(
      v.object({
        fullName: v.string(),
        team: v.string(),
        specialism: v.string(),
        contract: v.string(),
        email: v.string(),
        capacity: v.number(),
        maxTeachingHours: v.number(),
        role: v.string(),
        status: v.optional(v.string()),
        teachingAvailability: v.optional(v.number()),
        totalAllocated: v.optional(v.number()),
        totalContract: v.optional(v.number()),
        allocatedTeachingHours: v.optional(v.number()),
        allocatedAdminHours: v.optional(v.number()),
        family: v.optional(v.string()),
        fte: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const results = [];
    for (const lecturerData of args.lecturers) {
      try {
        // Set default values for optional fields
        const dataToInsert = {
          ...lecturerData,
          status: lecturerData.status || "available",
          teachingAvailability: lecturerData.teachingAvailability || lecturerData.capacity,
          totalAllocated: lecturerData.totalAllocated || 0,
          totalContract: lecturerData.totalContract || lecturerData.capacity,
          allocatedTeachingHours: lecturerData.allocatedTeachingHours || 0,
          allocatedAdminHours: lecturerData.allocatedAdminHours || 0,
          family: lecturerData.family || "",
          fte: lecturerData.fte || 1.0,
        };
        
        const lecturerId = await ctx.db.insert("lecturers", dataToInsert);
        results.push({ success: true, id: lecturerId, email: lecturerData.email });
      } catch (error) {
        results.push({ success: false, email: lecturerData.email, error: String(error) });
      }
    }
    return results;
  },
});