import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Migration 1: Fix academic_years table
export const migrateAcademicYears = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    try {
      // Get all academic years
      const academicYears = await ctx.db.query("academic_years").collect();
      let processed = 0;

      for (const year of academicYears) {
        const updates: any = {};

        // Set isStaging if missing
        if (year.isStaging === undefined) {
          updates.isStaging = false;
        }

        // Set organisationId if missing (default to null for now)
        if (year.organisationId === undefined) {
          updates.organisationId = null;
        }

        // Update the record if there are changes
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(year._id, updates);
        }

        processed++;
      }

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "migrate_academic_years",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "completed",
        details: { recordsProcessed: processed, recordsTotal: academicYears.length },
        createdAt: Date.now(),
      });

      return { success: true, recordsProcessed: processed, recordsTotal: academicYears.length };
    } catch (error) {
      await ctx.db.insert("data_migrations", {
        name: "migrate_academic_years",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "failed",
        details: { error: String(error) },
        createdAt: Date.now(),
      });

      throw error;
    }
  },
});

// Migration 2: Fix lecturers table
export const migrateLecturers = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    try {
      // Get all lecturers
      const lecturers = await ctx.db.query("lecturers").collect();
      let processed = 0;

      for (const lecturer of lecturers) {
        const updates: any = {};

        // Fix academicYearId if it's an empty string
        if (lecturer.academicYearId === "") {
          // Get the first active academic year or create a default one
          const activeYear = await ctx.db.query("academic_years")
            .filter(q => q.eq(q.field("isActive"), true))
            .first();
          
          if (activeYear) {
            updates.academicYearId = activeYear._id;
          } else {
            // Create a default academic year if none exists
            const defaultYearId = await ctx.db.insert("academic_years", {
              name: "2024/25",
              startDate: "2024-09-01",
              endDate: "2025-08-31",
              isActive: true,
              isStaging: false,
              description: "Default academic year created during migration",
              organisationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            updates.academicYearId = defaultYearId;
          }
        }

        // Set default values for required fields
        if (lecturer.isActive === undefined) {
          updates.isActive = true;
        }

        if (lecturer.createdAt === undefined) {
          updates.createdAt = Date.now();
        }

        if (lecturer.updatedAt === undefined) {
          updates.updatedAt = Date.now();
        }

        // Update the record if there are changes
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(lecturer._id, updates);
        }

        processed++;
      }

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "migrate_lecturers",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "completed",
        details: { recordsProcessed: processed, recordsTotal: lecturers.length },
        createdAt: Date.now(),
      });

      return { success: true, recordsProcessed: processed, recordsTotal: lecturers.length };
    } catch (error) {
      await ctx.db.insert("data_migrations", {
        name: "migrate_lecturers",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "failed",
        details: { error: String(error) },
        createdAt: Date.now(),
      });

      throw error;
    }
  },
});

// Migration 3: Fix module_iterations table
export const migrateModuleIterations = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    try {
      // Get all module iterations
      const moduleIterations = await ctx.db.query("module_iterations").collect();
      let processed = 0;

      for (const iteration of moduleIterations) {
        const updates: any = {};

        // Fix academicYearId if it's an empty string
        if (iteration.academicYearId === "") {
          // Get the first active academic year
          const activeYear = await ctx.db.query("academic_years")
            .filter(q => q.eq(q.field("isActive"), true))
            .first();
          
          if (activeYear) {
            updates.academicYearId = activeYear._id;
          }
        }

        // Set default values for required fields
        if (iteration.isActive === undefined) {
          updates.isActive = true;
        }

        if (iteration.createdAt === undefined) {
          updates.createdAt = Date.now();
        }

        if (iteration.updatedAt === undefined) {
          updates.updatedAt = Date.now();
        }

        // Update the record if there are changes
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(iteration._id, updates);
        }

        processed++;
      }

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "migrate_module_iterations",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "completed",
        details: { recordsProcessed: processed, recordsTotal: moduleIterations.length },
        createdAt: Date.now(),
      });

      return { success: true, recordsProcessed: processed, recordsTotal: moduleIterations.length };
    } catch (error) {
      await ctx.db.insert("data_migrations", {
        name: "migrate_module_iterations",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "failed",
        details: { error: String(error) },
        createdAt: Date.now(),
      });

      throw error;
    }
  },
});

// Migration 4: Fix module_allocations table
export const migrateModuleAllocations = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    try {
      // Get all module allocations
      const allocations = await ctx.db.query("module_allocations").collect();
      let processed = 0;

      for (const allocation of allocations) {
        const updates: any = {};

        // Fix lecturerId if it's a string instead of an ID
        if (typeof allocation.lecturerId === "string" && !allocation.lecturerId.startsWith("_")) {
          // Find the lecturer by email or other identifier
          const lecturer = await ctx.db.query("lecturers")
            .filter(q => q.eq(q.field("email"), allocation.lecturerId))
            .first();
          
          if (lecturer) {
            updates.lecturerId = lecturer._id;
          }
        }

        // Set default values for required fields
        if (allocation.isActive === undefined) {
          updates.isActive = true;
        }

        if (allocation.createdAt === undefined) {
          updates.createdAt = Date.now();
        }

        if (allocation.updatedAt === undefined) {
          updates.updatedAt = Date.now();
        }

        // Update the record if there are changes
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(allocation._id, updates);
        }

        processed++;
      }

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "migrate_module_allocations",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "completed",
        details: { recordsProcessed: processed, recordsTotal: allocations.length },
        createdAt: Date.now(),
      });

      return { success: true, recordsProcessed: processed, recordsTotal: allocations.length };
    } catch (error) {
      await ctx.db.insert("data_migrations", {
        name: "migrate_module_allocations",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "failed",
        details: { error: String(error) },
        createdAt: Date.now(),
      });

      throw error;
    }
  },
});

// Migration 5: Fix admin_allocations table
export const migrateAdminAllocations = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    try {
      // Get all admin allocations
      const allocations = await ctx.db.query("admin_allocations").collect();
      let processed = 0;

      for (const allocation of allocations) {
        const updates: any = {};

        // Set default values for required fields
        if (allocation.isActive === undefined) {
          updates.isActive = true;
        }

        if (allocation.createdAt === undefined) {
          updates.createdAt = Date.now();
        }

        if (allocation.updatedAt === undefined) {
          updates.updatedAt = Date.now();
        }

        // Update the record if there are changes
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(allocation._id, updates);
        }

        processed++;
      }

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "migrate_admin_allocations",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "completed",
        details: { recordsProcessed: processed, recordsTotal: allocations.length },
        createdAt: Date.now(),
      });

      return { success: true, recordsProcessed: processed, recordsTotal: allocations.length };
    } catch (error) {
      await ctx.db.insert("data_migrations", {
        name: "migrate_admin_allocations",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "failed",
        details: { error: String(error) },
        createdAt: Date.now(),
      });

      throw error;
    }
  },
});

// Migration 6: Fix cohorts table
export const migrateCohorts = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    try {
      // Get all cohorts
      const cohorts = await ctx.db.query("cohorts").collect();
      let processed = 0;

      for (const cohort of cohorts) {
        const updates: any = {};

        // Set default values for required fields
        if (cohort.isActive === undefined) {
          updates.isActive = true;
        }

        if (cohort.createdAt === undefined) {
          updates.createdAt = Date.now();
        }

        if (cohort.updatedAt === undefined) {
          updates.updatedAt = Date.now();
        }

        // Update the record if there are changes
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(cohort._id, updates);
        }

        processed++;
      }

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "migrate_cohorts",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "completed",
        details: { recordsProcessed: processed, recordsTotal: cohorts.length },
        createdAt: Date.now(),
      });

      return { success: true, recordsProcessed: processed, recordsTotal: cohorts.length };
    } catch (error) {
      await ctx.db.insert("data_migrations", {
        name: "migrate_cohorts",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "failed",
        details: { error: String(error) },
        createdAt: Date.now(),
      });

      throw error;
    }
  },
});

// Migration 7: Fix dept_summary table
export const migrateDeptSummary = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    try {
      // Get all department summaries
      const summaries = await ctx.db.query("dept_summary").collect();
      let processed = 0;

      for (const summary of summaries) {
        const updates: any = {};

        // Set default values for required fields
        if (summary.createdAt === undefined) {
          updates.createdAt = Date.now();
        }

        if (summary.updatedAt === undefined) {
          updates.updatedAt = Date.now();
        }

        // Update the record if there are changes
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(summary._id, updates);
        }

        processed++;
      }

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "migrate_dept_summary",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "completed",
        details: { recordsProcessed: processed, recordsTotal: summaries.length },
        createdAt: Date.now(),
      });

      return { success: true, recordsProcessed: processed, recordsTotal: summaries.length };
    } catch (error) {
      await ctx.db.insert("data_migrations", {
        name: "migrate_dept_summary",
        version: "1.0.0",
        appliedAt: Date.now(),
        duration: 0,
        status: "failed",
        details: { error: String(error) },
        createdAt: Date.now(),
      });

      throw error;
    }
  },
});

// Run all migrations in sequence
export const runAllMigrations = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    const results = [];
    
    try {
      // Run migrations in order
      const migrations = [
        { name: "Academic Years", fn: migrateAcademicYears },
        { name: "Lecturers", fn: migrateLecturers },
        { name: "Module Iterations", fn: migrateModuleIterations },
        { name: "Module Allocations", fn: migrateModuleAllocations },
        { name: "Admin Allocations", fn: migrateAdminAllocations },
        { name: "Cohorts", fn: migrateCohorts },
        { name: "Department Summary", fn: migrateDeptSummary },
      ];

      for (const migration of migrations) {
        try {
          const result = await migration.fn(ctx, { skipAuth: args.skipAuth });
          results.push({
            name: migration.name,
            success: true,
            ...result,
          });
        } catch (error) {
          results.push({
            name: migration.name,
            success: false,
            error: String(error),
          });
        }
      }

      return { success: true, results };
    } catch (error) {
      throw error;
    }
  },
});

// Get migration status
export const getMigrationStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const migrations = await ctx.db.query("data_migrations")
      .order("desc")
      .collect();

    return migrations;
  },
});

// Validate data integrity after migration
export const validateDataIntegrity = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const issues = [];

    // Check for invalid academic year references
    const lecturers = await ctx.db.query("lecturers").collect();
    for (const lecturer of lecturers) {
      if (lecturer.academicYearId && typeof lecturer.academicYearId === "string") {
        const year = await ctx.db.get(lecturer.academicYearId);
        if (!year) {
          issues.push({
            table: "lecturers",
            recordId: lecturer._id,
            issue: "Invalid academicYearId reference",
            value: lecturer.academicYearId,
          });
        }
      }
    }

    // Check for invalid lecturer references
    const moduleAllocations = await ctx.db.query("module_allocations").collect();
    for (const allocation of moduleAllocations) {
      if (allocation.lecturerId && typeof allocation.lecturerId === "string") {
        const lecturer = await ctx.db.get(allocation.lecturerId);
        if (!lecturer) {
          issues.push({
            table: "module_allocations",
            recordId: allocation._id,
            issue: "Invalid lecturerId reference",
            value: allocation.lecturerId,
          });
        }
      }
    }

    return {
      totalIssues: issues.length,
      issues,
    };
  },
}); 