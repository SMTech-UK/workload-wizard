import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Define the table schema
// This contains year-specific module data that changes between academic years
export default {
  profileId: v.id("module_profiles"), // Reference to the core module profile
  academicYearId: v.id("academic_years"), // Reference to academic year
  // Year-specific data that resets each year
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const getAll = query({
  args: {
    academicYearId: v.optional(v.id("academic_years")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    let modules;
    if (args.academicYearId) {
      modules = await ctx.db.query("modules")
        .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
        .collect();
    } else {
      modules = await ctx.db.query("modules").collect();
    }
    
    // Join with module profiles to get complete data
    const modulesWithProfiles = await Promise.all(
      modules.map(async (module) => {
        // Handle both old and new data structures
        if (module.profileId) {
          // New structure: get profile data
          const profile = await ctx.db.get(module.profileId);
          return {
            ...module,
            // Include profile data
            code: profile?.code || "",
            title: profile?.title || "",
            credits: profile?.credits || 0,
            level: profile?.level || 0,
            moduleLeader: profile?.moduleLeader || "",
            defaultTeachingHours: profile?.defaultTeachingHours || 0,
            defaultMarkingHours: profile?.defaultMarkingHours || 0,
          };
        } else {
          // Old structure: data is already in the module record
          return {
            ...module,
            profileId: null, // Ensure profileId is set for consistency
          };
        }
      })
    );
    
    return modulesWithProfiles;
  },
});

// NEW: Get available module profiles that aren't in a specific academic year
export const getAvailableProfiles = query({
  args: {
    academicYearId: v.id("academic_years"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get all module profiles
    const allProfiles = await ctx.db.query("module_profiles").collect();
    
    // Get profiles that are already in this academic year
    const existingModules = await ctx.db.query("modules")
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .collect();
    
    const existingProfileIds = new Set(
      existingModules
        .filter(m => m.profileId) // Only include records with profileId
        .map(m => m.profileId)
    );
    
    // Return profiles that aren't in this academic year
    return allProfiles.filter(profile => !existingProfileIds.has(profile._id));
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

// Mutation to create a new module for a specific academic year
export const createModule = mutation({
  args: {
    profileId: v.id("module_profiles"),
    academicYearId: v.id("academic_years"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.insert("modules", {
      profileId: args.profileId,
      academicYearId: args.academicYearId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// NEW: Create a new module profile and instance for a specific academic year
export const createNewModule = mutation({
  args: {
    // Profile data
    code: v.string(),
    title: v.string(),
    credits: v.number(),
    level: v.number(),
    moduleLeader: v.string(),
    defaultTeachingHours: v.number(),
    defaultMarkingHours: v.number(),
    // Academic year
    academicYearId: v.id("academic_years"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Create the module profile first
    const profileId = await ctx.db.insert("module_profiles", {
      code: args.code,
      title: args.title,
      credits: args.credits,
      level: args.level,
      moduleLeader: args.moduleLeader,
      defaultTeachingHours: args.defaultTeachingHours,
      defaultMarkingHours: args.defaultMarkingHours,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create the module instance for this specific academic year
    return await ctx.db.insert("modules", {
      profileId: profileId,
      academicYearId: args.academicYearId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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

// Mutation to create module instances for a new academic year
export const createForAcademicYear = mutation({
  args: {
    academicYearId: v.id("academic_years"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get all module profiles
    const profiles = await ctx.db.query("module_profiles").collect();
    
    const results = [];
    for (const profile of profiles) {
      try {
        // Check if module already exists for this academic year
        const existing = await ctx.db.query("modules")
          .filter((q) => 
            q.and(
              q.eq(q.field("profileId"), profile._id),
              q.eq(q.field("academicYearId"), args.academicYearId)
            )
          )
          .first();
        
        if (!existing) {
          // Create new module instance for this academic year
          const moduleId = await ctx.db.insert("modules", {
            profileId: profile._id,
            academicYearId: args.academicYearId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          results.push({ success: true, id: moduleId, code: profile.code });
        } else {
          results.push({ success: false, code: profile.code, error: "Already exists for this academic year" });
        }
      } catch (error) {
        results.push({ success: false, code: profile.code, error: String(error) });
      }
    }
    return results;
  },
});

// NEW: Add a specific module profile to an academic year
export const addProfileToAcademicYear = mutation({
  args: {
    profileId: v.id("module_profiles"),
    academicYearId: v.id("academic_years"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if module already exists for this academic year
    const existing = await ctx.db.query("modules")
      .filter((q) => 
        q.and(
          q.eq(q.field("profileId"), args.profileId),
          q.eq(q.field("academicYearId"), args.academicYearId)
        )
      )
      .first();
    
    if (existing) {
      throw new Error("Module already exists for this academic year");
    }
    
    // Create new module instance for this academic year
    return await ctx.db.insert("modules", {
      profileId: args.profileId,
      academicYearId: args.academicYearId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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