import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  teamId: v.optional(v.id("teams")),
  departmentId: v.optional(v.id("departments")),
  facultyId: v.optional(v.id("faculties")),
  academicYearId: v.id("academic_years"),
  period: v.string(), // e.g., "Semester 1", "Full Year", "Q1", "Q2"
  periodStartDate: v.string(), // ISO date string
  periodEndDate: v.string(), // ISO date string
  totalLecturers: v.number(),
  totalModules: v.number(),
  totalAllocations: v.number(),
  totalTeachingHours: v.number(),
  totalAssessmentHours: v.number(),
  totalAdminHours: v.number(),
  totalWorkloadHours: v.number(),
  averageWorkloadPerLecturer: v.number(),
  maxWorkloadPerLecturer: v.number(),
  minWorkloadPerLecturer: v.number(),
  workloadDistribution: v.object({
    underLoaded: v.number(), // Lecturers with <80% of target
    balanced: v.number(), // Lecturers with 80-120% of target
    overLoaded: v.number(), // Lecturers with >120% of target
  }),
  moduleDistribution: v.object({
    coreModules: v.number(),
    optionalModules: v.number(),
    newModules: v.number(),
    discontinuedModules: v.number(),
  }),
  allocationDistribution: v.object({
    teachingAllocations: v.number(),
    assessmentAllocations: v.number(),
    adminAllocations: v.number(),
  }),
  isActive: v.boolean(),
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all team summaries
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("team_summaries")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get team summary by ID
export const getById = query({
  args: { id: v.id("team_summaries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const summary = await ctx.db.get(args.id);
    if (!summary || summary.deletedAt) return null;
    return summary;
  },
});

// Get team summaries by team
export const getByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("team_summaries")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get team summaries by department
export const getByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("team_summaries")
      .filter((q) => q.eq(q.field("departmentId"), args.departmentId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get team summaries by faculty
export const getByFaculty = query({
  args: { facultyId: v.id("faculties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("team_summaries")
      .filter((q) => q.eq(q.field("facultyId"), args.facultyId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get team summaries by academic year
export const getByAcademicYear = query({
  args: { academicYearId: v.id("academic_years") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("team_summaries")
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get team summaries by period
export const getByPeriod = query({
  args: { period: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("team_summaries")
      .filter((q) => q.eq(q.field("period"), args.period))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get latest team summary for a team
export const getLatestByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("team_summaries")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .first();
  },
});

// Get team summaries with high workload
export const getHighWorkloadSummaries = query({
  args: { threshold: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const threshold = args.threshold ?? 120; // Default to 120% of target
    
    return await ctx.db
      .query("team_summaries")
      .filter((q) => q.gte(q.field("averageWorkloadPerLecturer"), threshold))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Create a new team summary
export const create = mutation({
  args: {
    teamId: v.optional(v.id("teams")),
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
    academicYearId: v.id("academic_years"),
    period: v.string(),
    periodStartDate: v.string(),
    periodEndDate: v.string(),
    totalLecturers: v.number(),
    totalModules: v.number(),
    totalAllocations: v.number(),
    totalTeachingHours: v.number(),
    totalAssessmentHours: v.number(),
    totalAdminHours: v.number(),
    totalWorkloadHours: v.number(),
    averageWorkloadPerLecturer: v.number(),
    maxWorkloadPerLecturer: v.number(),
    minWorkloadPerLecturer: v.number(),
    workloadDistribution: v.object({
      underLoaded: v.number(),
      balanced: v.number(),
      overLoaded: v.number(),
    }),
    moduleDistribution: v.object({
      coreModules: v.number(),
      optionalModules: v.number(),
      newModules: v.number(),
      discontinuedModules: v.number(),
    }),
    allocationDistribution: v.object({
      teachingAllocations: v.number(),
      assessmentAllocations: v.number(),
      adminAllocations: v.number(),
    }),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Validate dates
    if (new Date(args.periodStartDate) >= new Date(args.periodEndDate)) {
      throw new Error("Period start date must be before period end date");
    }
    
    // Validate numeric values
    if (args.totalLecturers < 0) {
      throw new Error("Total lecturers cannot be negative");
    }
    if (args.totalModules < 0) {
      throw new Error("Total modules cannot be negative");
    }
    if (args.totalAllocations < 0) {
      throw new Error("Total allocations cannot be negative");
    }
    if (args.totalTeachingHours < 0) {
      throw new Error("Total teaching hours cannot be negative");
    }
    if (args.totalAssessmentHours < 0) {
      throw new Error("Total assessment hours cannot be negative");
    }
    if (args.totalAdminHours < 0) {
      throw new Error("Total admin hours cannot be negative");
    }
    if (args.totalWorkloadHours < 0) {
      throw new Error("Total workload hours cannot be negative");
    }
    if (args.averageWorkloadPerLecturer < 0) {
      throw new Error("Average workload per lecturer cannot be negative");
    }
    if (args.maxWorkloadPerLecturer < 0) {
      throw new Error("Max workload per lecturer cannot be negative");
    }
    if (args.minWorkloadPerLecturer < 0) {
      throw new Error("Min workload per lecturer cannot be negative");
    }
    
    return await ctx.db.insert("team_summaries", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a team summary
export const update = mutation({
  args: {
    id: v.id("team_summaries"),
    period: v.optional(v.string()),
    periodStartDate: v.optional(v.string()),
    periodEndDate: v.optional(v.string()),
    totalLecturers: v.optional(v.number()),
    totalModules: v.optional(v.number()),
    totalAllocations: v.optional(v.number()),
    totalTeachingHours: v.optional(v.number()),
    totalAssessmentHours: v.optional(v.number()),
    totalAdminHours: v.optional(v.number()),
    totalWorkloadHours: v.optional(v.number()),
    averageWorkloadPerLecturer: v.optional(v.number()),
    maxWorkloadPerLecturer: v.optional(v.number()),
    minWorkloadPerLecturer: v.optional(v.number()),
    workloadDistribution: v.optional(v.object({
      underLoaded: v.number(),
      balanced: v.number(),
      overLoaded: v.number(),
    })),
    moduleDistribution: v.optional(v.object({
      coreModules: v.number(),
      optionalModules: v.number(),
      newModules: v.number(),
      discontinuedModules: v.number(),
    })),
    allocationDistribution: v.optional(v.object({
      teachingAllocations: v.number(),
      assessmentAllocations: v.number(),
      adminAllocations: v.number(),
    })),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // Validate dates if provided
    if (updates.periodStartDate && updates.periodEndDate) {
      if (new Date(updates.periodStartDate) >= new Date(updates.periodEndDate)) {
        throw new Error("Period start date must be before period end date");
      }
    }
    
    // Validate numeric values if provided
    const numericFields = [
      'totalLecturers', 'totalModules', 'totalAllocations',
      'totalTeachingHours', 'totalAssessmentHours', 'totalAdminHours',
      'totalWorkloadHours', 'averageWorkloadPerLecturer',
      'maxWorkloadPerLecturer', 'minWorkloadPerLecturer'
    ];
    
    for (const field of numericFields) {
      if (updates[field] !== undefined && updates[field] < 0) {
        throw new Error(`${field} cannot be negative`);
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a team summary
export const remove = mutation({
  args: { id: v.id("team_summaries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get team summaries with full relationship information
export const getAllWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const summaries = await ctx.db
      .query("team_summaries")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
    
    // Fetch related information for each summary
    const summariesWithRelations = await Promise.all(
      summaries.map(async (summary) => {
        let team = null;
        if (summary.teamId) {
          team = await ctx.db.get(summary.teamId);
        }
        
        let department = null;
        if (summary.departmentId) {
          department = await ctx.db.get(summary.departmentId);
        }
        
        let faculty = null;
        if (summary.facultyId) {
          faculty = await ctx.db.get(summary.facultyId);
        }
        
        const academicYear = await ctx.db.get(summary.academicYearId);
        
        return {
          ...summary,
          team,
          department,
          faculty,
          academicYear,
        };
      })
    );
    
    return summariesWithRelations;
  },
}); 