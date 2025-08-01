import { v } from "convex/values";
import { mutation, query } from "./_generated/server";



// Get all academic years
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("academic_years").order("desc").collect();
  },
});

// Get the active academic year
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("academic_years").filter((q) => q.eq(q.field("isActive"), true)).first();
  },
});

// Get academic year by ID
export const getById = query({
  args: { id: v.id("academic_years") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Create a new academic year
export const create = mutation({
  args: {
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isStaging: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // If this is being set as active, deactivate all other academic years
    if (args.isActive) {
      const activeYears = await ctx.db.query("academic_years").filter((q) => q.eq(q.field("isActive"), true)).collect();
      for (const year of activeYears) {
        await ctx.db.patch(year._id, { isActive: false });
      }
    }
    
    // If this is being set as staging, unset all other staging years
    if (args.isStaging) {
      const stagingYears = await ctx.db.query("academic_years").filter((q) => q.eq(q.field("isStaging"), true)).collect();
      for (const year of stagingYears) {
        await ctx.db.patch(year._id, { isStaging: false });
      }
    }
    
    const academicYearId = await ctx.db.insert("academic_years", {
      ...args,
      isActive: args.isActive ?? false,
      isStaging: args.isStaging ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Note: Lecturer and module instances should be created separately
    // using the createForAcademicYear functions in lecturers.ts and modules.ts

    return academicYearId;
  },
});

// Update an academic year
export const update = mutation({
  args: {
    id: v.id("academic_years"),
    name: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isStaging: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updateData } = args;
    
    // If this is being set as active, deactivate all other academic years
    if (updateData.isActive) {
      const activeYears = await ctx.db.query("academic_years").filter((q) => q.eq(q.field("isActive"), true)).collect();
      for (const year of activeYears) {
        if (year._id !== id) {
          await ctx.db.patch(year._id, { isActive: false });
        }
      }
    }
    
    // If this is being set as staging, unset all other staging years
    if (updateData.isStaging) {
      const stagingYears = await ctx.db.query("academic_years").filter((q) => q.eq(q.field("isStaging"), true)).collect();
      for (const year of stagingYears) {
        if (year._id !== id) {
          await ctx.db.patch(year._id, { isStaging: false });
        }
      }
    }
    
    return await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

// Delete an academic year
export const remove = mutation({
  args: { id: v.id("academic_years") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if this academic year has any associated data
    const moduleIterations = await ctx.db.query("module_iterations").filter((q) => q.eq(q.field("academicYearId"), args.id)).collect();
    const lecturers = await ctx.db.query("lecturers").filter((q) => q.eq(q.field("academicYearId"), args.id)).collect();
    const modules = await ctx.db.query("modules").filter((q) => q.eq(q.field("academicYearId"), args.id)).collect();
    
    if (moduleIterations.length > 0 || lecturers.length > 0 || modules.length > 0) {
      throw new Error("Cannot delete academic year with associated data. Please remove all associated data first.");
    }
    
    return await ctx.db.delete(args.id);
  },
});

// Set an academic year as active
export const setActive = mutation({
  args: { id: v.id("academic_years") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Deactivate all other academic years
    const activeYears = await ctx.db.query("academic_years").filter((q) => q.eq(q.field("isActive"), true)).collect();
    for (const year of activeYears) {
      await ctx.db.patch(year._id, { isActive: false });
    }
    
    // Activate the specified academic year
    return await ctx.db.patch(args.id, { 
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

// Set an academic year as staging
export const setStaging = mutation({
  args: { id: v.id("academic_years") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Unset all other staging years
    const stagingYears = await ctx.db.query("academic_years").filter((q) => q.eq(q.field("isStaging"), true)).collect();
    for (const year of stagingYears) {
      await ctx.db.patch(year._id, { isStaging: false });
    }
    
    // Set the specified academic year as staging
    return await ctx.db.patch(args.id, { 
      isStaging: true,
      updatedAt: Date.now(),
    });
  },
}); 