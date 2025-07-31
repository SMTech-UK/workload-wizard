import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const migrateProfileStructure = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    const startTime = Date.now();
    let recordsProcessed = 0;
    let errors: Array<{ step: string; error: string; details?: any }> = [];

    try {
      // Step 1: Migrate lecturer data to profile structure
      console.log("Starting lecturer profile migration...");
      
      // Get all lecturers that don't have a profileId (old structure)
      const oldLecturers = await ctx.db.query("lecturers")
        .filter(q => q.eq(q.field("profileId"), undefined))
        .collect();

      for (const lecturer of oldLecturers) {
        try {
          // Create lecturer profile from existing data
          const profileId = await ctx.db.insert("lecturer_profiles", {
            fullName: lecturer.fullName || `${lecturer.givenName || ""} ${lecturer.familyName || ""}`.trim(),
            email: lecturer.email,
            team: lecturer.team,
            specialism: lecturer.specialism,
            contract: lecturer.contract || "Full-time",
            role: lecturer.role,
            family: lecturer.family,
            fte: lecturer.fte || 1.0,
            capacity: lecturer.capacity || 0,
            maxTeachingHours: lecturer.maxTeachingHours || 0,
            totalContract: lecturer.totalContract || 0,
            organisationId: lecturer.organisationId,
            createdAt: lecturer.createdAt,
            updatedAt: Date.now(),
          });

          // Update lecturer record with profileId
          await ctx.db.patch(lecturer._id, {
            profileId: profileId,
            // Reset year-specific values to defaults
            teachingAvailability: 0,
            totalAllocated: 0,
            allocatedTeachingHours: 0,
            allocatedAdminHours: 0,
            updatedAt: Date.now(),
          });

          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "lecturer_profile_creation",
            error: String(error),
            details: { lecturerId: lecturer._id, email: lecturer.email }
          });
        }
      }

      // Step 2: Migrate module data to profile structure
      console.log("Starting module profile migration...");
      
      // Get all modules that don't have a profile structure
      const oldModules = await ctx.db.query("modules").collect();

      for (const module of oldModules) {
        try {
          // Create module profile if it doesn't exist
          const existingProfile = await ctx.db.query("module_profiles")
            .filter(q => q.eq(q.field("code"), module.code))
            .first();

          if (!existingProfile) {
            await ctx.db.insert("module_profiles", {
              code: module.code,
              title: module.title,
              credits: module.credits,
              level: module.level,
              moduleLeader: module.moduleLeader,
              defaultTeachingHours: module.defaultTeachingHours,
              defaultMarkingHours: module.defaultMarkingHours,
              organisationId: module.organisationId,
              createdAt: module.createdAt,
              updatedAt: Date.now(),
            });
          }

          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "module_profile_creation",
            error: String(error),
            details: { moduleId: module._id, code: module.code }
          });
        }
      }

      // Step 3: Migrate user data to profile structure
      console.log("Starting user profile migration...");
      
      const users = await ctx.db.query("users").collect();

      for (const user of users) {
        try {
          // Check if user profile already exists
          const existingProfile = await ctx.db.query("user_profiles")
            .filter(q => q.eq(q.field("userId"), user.tokenIdentifier))
            .first();

          if (!existingProfile) {
            await ctx.db.insert("user_profiles", {
              userId: user.tokenIdentifier,
              email: user.email,
              firstName: user.givenName,
              lastName: user.familyName,
              isActive: user.isActive,
              organisationId: user.organisationId,
              createdAt: user.createdAt || Date.now(),
              updatedAt: Date.now(),
            });
          }

          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "user_profile_creation",
            error: String(error),
            details: { userId: user._id, email: user.email }
          });
        }
      }

      const duration = Date.now() - startTime;

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "profile_structure_migration",
        version: "2.0.0",
        appliedAt: Date.now(),
        duration,
        status: errors.length === 0 ? "completed" : "completed_with_errors",
        details: { 
          recordsProcessed, 
          errors: errors.length,
          errorDetails: errors,
          steps: [
            "lecturer_profile_creation",
            "module_profile_creation", 
            "user_profile_creation"
          ]
        },
        createdAt: Date.now(),
      });

      return { 
        success: true, 
        recordsProcessed, 
        duration,
        errors: errors.length,
        errorDetails: errors
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      await ctx.db.insert("data_migrations", {
        name: "profile_structure_migration",
        version: "2.0.0",
        appliedAt: Date.now(),
        duration,
        status: "failed",
        details: { error: String(error), recordsProcessed },
        createdAt: Date.now(),
      });

      throw error;
    }
  },
}); 