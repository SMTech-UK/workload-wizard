import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("modules").collect();
  },
});

// Query to get a single module by ID
export const getById = query({
  args: { id: v.id("modules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Mutation to create a new module
export const createModule = mutation({
  args: {
    code: v.string(),
    title: v.string(),
    credits: v.number(),
    level: v.number(),
    moduleLeader: v.string(),
    defaultTeachingHours: v.number(),
    defaultMarkingHours: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.insert("modules", args);
  },
});

// Mutation to update a module
export const updateModule = mutation({
  args: {
    id: v.id("modules"),
    code: v.string(),
    title: v.string(),
    credits: v.number(),
    level: v.number(),
    moduleLeader: v.string(),
    defaultTeachingHours: v.number(),
    defaultMarkingHours: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, updateData);
  },
});

// Mutation to delete a module
export const deleteModule = mutation({
  args: { id: v.id("modules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.delete(args.id);
  },
});

// Mutation to bulk import modules
export const bulkImport = mutation({
  args: {
    modules: v.array(
      v.object({
        code: v.string(),
        title: v.string(),
        credits: v.number(),
        level: v.number(),
        moduleLeader: v.string(),
        defaultTeachingHours: v.number(),
        defaultMarkingHours: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const results = [];
    for (const moduleData of args.modules) {
      try {
        const moduleId = await ctx.db.insert("modules", moduleData);
        results.push({ success: true, id: moduleId, code: moduleData.code });
      } catch (error) {
        results.push({ success: false, code: moduleData.code, error: String(error) });
      }
    }
    return results;
  },
});



// Query to get all module allocations
export const getAllAllocations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
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
        groupNumber: v.number(),
        siteName: v.string(),
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