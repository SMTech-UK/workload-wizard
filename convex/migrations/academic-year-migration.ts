import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const migrateAcademicYearAssignment = mutation({
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
      // Step 1: Ensure we have a default academic year
      console.log("Ensuring default academic year exists...");
      
      let defaultAcademicYear = await ctx.db.query("academic_years")
        .filter(q => q.eq(q.field("isActive"), true))
        .first();

      if (!defaultAcademicYear) {
        // Create a default academic year if none exists
        defaultAcademicYear = await ctx.db.insert("academic_years", {
          name: "2024/25",
          startDate: "2024-09-01",
          endDate: "2025-08-31",
          isActive: true,
          isStaging: false,
          description: "Default academic year created by migration",
          organisationId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      // Step 2: Assign lecturers to academic years
      console.log("Assigning lecturers to academic years...");
      
      const unassignedLecturers = await ctx.db.query("lecturers")
        .filter(q => q.eq(q.field("academicYearId"), ""))
        .collect();

      for (const lecturer of unassignedLecturers) {
        try {
          await ctx.db.patch(lecturer._id, {
            academicYearId: defaultAcademicYear._id,
            updatedAt: Date.now(),
          });
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "lecturer_academic_year_assignment",
            error: String(error),
            details: { lecturerId: lecturer._id }
          });
        }
      }

      // Step 3: Assign module iterations to academic years
      console.log("Assigning module iterations to academic years...");
      
      const unassignedModuleIterations = await ctx.db.query("module_iterations")
        .filter(q => q.eq(q.field("academicYearId"), ""))
        .collect();

      for (const iteration of unassignedModuleIterations) {
        try {
          await ctx.db.patch(iteration._id, {
            academicYearId: defaultAcademicYear._id,
            updatedAt: Date.now(),
          });
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "module_iteration_academic_year_assignment",
            error: String(error),
            details: { iterationId: iteration._id }
          });
        }
      }

      // Step 4: Assign admin allocations to academic years
      console.log("Assigning admin allocations to academic years...");
      
      const unassignedAdminAllocations = await ctx.db.query("admin_allocations")
        .filter(q => q.eq(q.field("academicYearId"), ""))
        .collect();

      for (const allocation of unassignedAdminAllocations) {
        try {
          await ctx.db.patch(allocation._id, {
            academicYearId: defaultAcademicYear._id,
            updatedAt: Date.now(),
          });
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "admin_allocation_academic_year_assignment",
            error: String(error),
            details: { allocationId: allocation._id }
          });
        }
      }

      // Step 5: Assign cohort module plans to academic years
      console.log("Assigning cohort module plans to academic years...");
      
      const unassignedCohortPlans = await ctx.db.query("cohort_module_plans")
        .filter(q => q.eq(q.field("academicYearId"), ""))
        .collect();

      for (const plan of unassignedCohortPlans) {
        try {
          await ctx.db.patch(plan._id, {
            academicYearId: defaultAcademicYear._id,
            updatedAt: Date.now(),
          });
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "cohort_plan_academic_year_assignment",
            error: String(error),
            details: { planId: plan._id }
          });
        }
      }

      // Step 6: Assign team summaries to academic years
      console.log("Assigning team summaries to academic years...");
      
      const unassignedTeamSummaries = await ctx.db.query("team_summaries")
        .filter(q => q.eq(q.field("academicYearId"), ""))
        .collect();

      for (const summary of unassignedTeamSummaries) {
        try {
          await ctx.db.patch(summary._id, {
            academicYearId: defaultAcademicYear._id,
            updatedAt: Date.now(),
          });
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "team_summary_academic_year_assignment",
            error: String(error),
            details: { summaryId: summary._id }
          });
        }
      }

      // Step 7: Assign workload reports to academic years
      console.log("Assigning workload reports to academic years...");
      
      const unassignedWorkloadReports = await ctx.db.query("workload_reports")
        .filter(q => q.eq(q.field("academicYearId"), ""))
        .collect();

      for (const report of unassignedWorkloadReports) {
        try {
          await ctx.db.patch(report._id, {
            academicYearId: defaultAcademicYear._id,
            updatedAt: Date.now(),
          });
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "workload_report_academic_year_assignment",
            error: String(error),
            details: { reportId: report._id }
          });
        }
      }

      // Step 8: Create semester periods for the default academic year
      console.log("Creating semester periods for default academic year...");
      
      const existingSemesterPeriods = await ctx.db.query("semester_periods")
        .filter(q => q.eq(q.field("academicYearId"), defaultAcademicYear._id))
        .collect();

      if (existingSemesterPeriods.length === 0) {
        const semesterPeriods = [
          {
            name: "Semester 1",
            startDate: "2024-09-01",
            endDate: "2025-01-31",
            isActive: true,
            order: 1,
          },
          {
            name: "Semester 2", 
            startDate: "2025-02-01",
            endDate: "2025-06-30",
            isActive: true,
            order: 2,
          },
          {
            name: "Summer Period",
            startDate: "2025-07-01", 
            endDate: "2025-08-31",
            isActive: true,
            order: 3,
          }
        ];

        for (const period of semesterPeriods) {
          try {
            await ctx.db.insert("semester_periods", {
              academicYearId: defaultAcademicYear._id,
              ...period,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          } catch (error) {
            errors.push({
              step: "semester_period_creation",
              error: String(error),
              details: { periodName: period.name }
            });
          }
        }
      }

      const duration = Date.now() - startTime;

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "academic_year_assignment_migration",
        version: "2.0.0",
        appliedAt: Date.now(),
        duration,
        status: errors.length === 0 ? "completed" : "completed_with_errors",
        details: { 
          recordsProcessed, 
          errors: errors.length,
          errorDetails: errors,
          defaultAcademicYearId: defaultAcademicYear._id,
          steps: [
            "default_academic_year_creation",
            "lecturer_academic_year_assignment",
            "module_iteration_academic_year_assignment",
            "admin_allocation_academic_year_assignment",
            "cohort_plan_academic_year_assignment",
            "team_summary_academic_year_assignment",
            "workload_report_academic_year_assignment",
            "semester_period_creation"
          ]
        },
        createdAt: Date.now(),
      });

      return { 
        success: true, 
        recordsProcessed, 
        duration,
        errors: errors.length,
        errorDetails: errors,
        defaultAcademicYearId: defaultAcademicYear._id
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      await ctx.db.insert("data_migrations", {
        name: "academic_year_assignment_migration",
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