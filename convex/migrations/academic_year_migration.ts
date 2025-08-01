import { mutation } from "../_generated/server";

export const migrateAcademicYears = mutation({
  args: {},
  handler: async (ctx) => {
    // Get or create a default academic year
    let defaultAcademicYear = await ctx.db.query("academic_years")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();

    if (!defaultAcademicYear) {
      // Create a default academic year if none exists
      const academicYearId = await ctx.db.insert("academic_years", {
        name: "2024/25",
        startDate: "2024-09-01",
        endDate: "2025-08-31",
        isActive: true,
        isStaging: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      defaultAcademicYear = await ctx.db.get(academicYearId);
    }

    if (!defaultAcademicYear) {
      throw new Error("Failed to create or retrieve default academic year");
    }

    // Migrate lecturers without academic year
    const unassignedLecturers = await ctx.db.query("lecturers")
      .filter(q => q.eq(q.field("academicYearId"), undefined))
      .collect();

    for (const lecturer of unassignedLecturers) {
      await ctx.db.patch(lecturer._id, {
        academicYearId: defaultAcademicYear._id,
        updatedAt: Date.now(),
      });
    }

    // Migrate modules without academic year
    const unassignedModules = await ctx.db.query("modules")
      .filter(q => q.eq(q.field("academicYearId"), undefined))
      .collect();

    for (const module of unassignedModules) {
      await ctx.db.patch(module._id, {
        academicYearId: defaultAcademicYear._id,
        updatedAt: Date.now(),
      });
    }

    // Migrate module iterations without academic year
    const unassignedIterations = await ctx.db.query("module_iterations")
      .filter(q => q.eq(q.field("academicYearId"), undefined))
      .collect();

    for (const iteration of unassignedIterations) {
      await ctx.db.patch(iteration._id, {
        academicYearId: defaultAcademicYear._id,
        updatedAt: Date.now(),
      });
    }

    // Migrate admin allocations without academic year
    const unassignedAllocations = await ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("academicYearId"), undefined))
      .collect();

    for (const allocation of unassignedAllocations) {
      await ctx.db.patch(allocation._id, {
        academicYearId: defaultAcademicYear._id,
        updatedAt: Date.now(),
      });
    }

    // Migrate cohort module plans without academic year
    const unassignedPlans = await ctx.db.query("cohort_module_plans")
      .filter(q => q.eq(q.field("academicYearId"), undefined))
      .collect();

    for (const plan of unassignedPlans) {
      await ctx.db.patch(plan._id, {
        academicYearId: defaultAcademicYear._id,
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: "Academic year migration completed",
      defaultAcademicYearId: defaultAcademicYear._id,
      migratedLecturers: unassignedLecturers.length,
      migratedModules: unassignedModules.length,
      migratedIterations: unassignedIterations.length,
      migratedAllocations: unassignedAllocations.length,
      migratedPlans: unassignedPlans.length,
    };
  },
}); 