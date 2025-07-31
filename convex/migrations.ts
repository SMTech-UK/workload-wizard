import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const migrateDataToAcademicYear = mutation({
  args: {
    academicYearId: v.id("academic_years"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const results = {
      moduleIterations: 0,
      lecturers: 0,
      modules: 0,
      errors: [] as string[],
    };

    try {
      // Migrate module iterations
      const iterations = await ctx.db.query("module_iterations")
        .filter((q) => q.eq(q.field("academicYearId"), undefined))
        .collect();
      
      for (const iteration of iterations) {
        await ctx.db.patch(iteration._id, { academicYearId: args.academicYearId });
        results.moduleIterations++;
      }
    } catch (error) {
      results.errors.push(`Module iterations: ${error}`);
    }

    try {
      // Migrate lecturers
      const lecturers = await ctx.db.query("lecturers")
        .filter((q) => q.eq(q.field("academicYearId"), undefined))
        .collect();
      
      for (const lecturer of lecturers) {
        await ctx.db.patch(lecturer._id, { academicYearId: args.academicYearId });
        results.lecturers++;
      }
    } catch (error) {
      results.errors.push(`Lecturers: ${error}`);
    }

    try {
      // Migrate modules
      const modules = await ctx.db.query("modules")
        .filter((q) => q.eq(q.field("academicYearId"), undefined))
        .collect();
      
      for (const module of modules) {
        await ctx.db.patch(module._id, { academicYearId: args.academicYearId });
        results.modules++;
      }
    } catch (error) {
      results.errors.push(`Modules: ${error}`);
    }

    return results;
  },
});

export const getMigrationStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const unassignedIterations = await ctx.db.query("module_iterations")
      .filter((q) => q.eq(q.field("academicYearId"), undefined))
      .collect();
    
    const unassignedLecturers = await ctx.db.query("lecturers")
      .filter((q) => q.eq(q.field("academicYearId"), undefined))
      .collect();
    
    const unassignedModules = await ctx.db.query("modules")
      .filter((q) => q.eq(q.field("academicYearId"), undefined))
      .collect();
    
    return {
      unassignedIterations: unassignedIterations.length,
      unassignedLecturers: unassignedLecturers.length,
      unassignedModules: unassignedModules.length,
      hasUnassignedData: unassignedIterations.length > 0 || unassignedLecturers.length > 0 || unassignedModules.length > 0,
    };
  },
});

// NEW: Migrate existing data to profile-based structure
export const migrateToProfileStructure = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const results = {
      lecturerProfiles: 0,
      moduleProfiles: 0,
      errors: [] as string[],
    };

    try {
      // Migrate existing lecturers to lecturer profiles
      const existingLecturers = await ctx.db.query("lecturers").collect();
      
      for (const lecturer of existingLecturers) {
        try {
          // Create lecturer profile
          const profileId = await ctx.db.insert("lecturer_profiles", {
            fullName: lecturer.fullName,
            team: lecturer.team,
            specialism: lecturer.specialism,
            contract: lecturer.contract,
            email: lecturer.email,
            role: lecturer.role,
            family: lecturer.family,
            fte: lecturer.fte,
            capacity: lecturer.capacity,
            maxTeachingHours: lecturer.maxTeachingHours,
            totalContract: lecturer.totalContract,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          // Update lecturer to reference profile
          await ctx.db.patch(lecturer._id, {
            profileId: profileId,
            // Keep year-specific data
            status: lecturer.status,
            teachingAvailability: lecturer.teachingAvailability,
            totalAllocated: lecturer.totalAllocated,
            allocatedTeachingHours: lecturer.allocatedTeachingHours,
            allocatedAdminHours: lecturer.allocatedAdminHours,
            updatedAt: Date.now(),
          });

          results.lecturerProfiles++;
        } catch (error) {
          results.errors.push(`Lecturer ${lecturer.email}: ${error}`);
        }
      }
    } catch (error) {
      results.errors.push(`Lecturer profiles: ${error}`);
    }

    try {
      // Migrate existing modules to module profiles
      const existingModules = await ctx.db.query("modules").collect();
      
      for (const module of existingModules) {
        try {
          // Create module profile
          const profileId = await ctx.db.insert("module_profiles", {
            code: module.code,
            title: module.title,
            credits: module.credits,
            level: module.level,
            moduleLeader: module.moduleLeader,
            defaultTeachingHours: module.defaultTeachingHours,
            defaultMarkingHours: module.defaultMarkingHours,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          // Update module to reference profile
          await ctx.db.patch(module._id, {
            profileId: profileId,
            updatedAt: Date.now(),
          });

          results.moduleProfiles++;
        } catch (error) {
          results.errors.push(`Module ${module.code}: ${error}`);
        }
      }
    } catch (error) {
      results.errors.push(`Module profiles: ${error}`);
    }

    return results;
  },
});

// NEW: Get migration status for profile structure
export const getProfileMigrationStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const lecturers = await ctx.db.query("lecturers").collect();
    const modules = await ctx.db.query("modules").collect();
    
    const lecturersWithoutProfiles = lecturers.filter(l => !l.profileId);
    const modulesWithoutProfiles = modules.filter(m => !m.profileId);
    
    return {
      lecturersWithoutProfiles: lecturersWithoutProfiles.length,
      modulesWithoutProfiles: modulesWithoutProfiles.length,
      needsProfileMigration: lecturersWithoutProfiles.length > 0 || modulesWithoutProfiles.length > 0,
    };
  },
}); 