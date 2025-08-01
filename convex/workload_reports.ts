import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  reportType: v.string(), // e.g., "Individual", "Team", "Department", "Faculty", "Organisation"
  scope: v.string(), // e.g., "Academic Year", "Semester", "Quarter", "Custom Period"
  academicYearId: v.optional(v.id("academic_years")),
  startDate: v.optional(v.string()), // ISO date string
  endDate: v.optional(v.string()), // ISO date string
  generatedBy: v.string(), // User ID who generated the report
  status: v.string(), // e.g., "Draft", "Generated", "Published", "Archived"
  format: v.string(), // e.g., "PDF", "Excel", "CSV", "JSON"
  fileUrl: v.optional(v.string()), // URL to the generated report file
  fileSize: v.optional(v.number()), // File size in bytes
  filters: v.optional(v.object({
    departments: v.optional(v.array(v.id("departments"))),
    faculties: v.optional(v.array(v.id("faculties"))),
    teams: v.optional(v.array(v.id("teams"))),
    lecturers: v.optional(v.array(v.id("lecturers"))),
    modules: v.optional(v.array(v.id("modules"))),
    allocationTypes: v.optional(v.array(v.id("allocation_types"))),
    workloadRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
    })),
  })),
  metrics: v.optional(v.object({
    totalLecturers: v.number(),
    totalModules: v.number(),
    totalAllocations: v.number(),
    totalTeachingHours: v.number(),
    totalAssessmentHours: v.number(),
    totalAdminHours: v.number(),
    averageWorkload: v.number(),
    maxWorkload: v.number(),
    minWorkload: v.number(),
  })),
  isActive: v.boolean(),
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all workload reports
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_reports")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get workload report by ID
export const getById = query({
  args: { id: v.id("workload_reports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const report = await ctx.db.get(args.id);
    if (!report || report.deletedAt) return null;
    return report;
  },
});

// Get reports by type
export const getByType = query({
  args: { reportType: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_reports")
      .filter((q) => q.eq(q.field("reportType"), args.reportType))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get reports by status
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_reports")
      .filter((q) => q.eq(q.field("status"), args.status))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get reports by format
export const getByFormat = query({
  args: { format: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_reports")
      .filter((q) => q.eq(q.field("format"), args.format))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get reports by academic year
export const getByAcademicYear = query({
  args: { academicYearId: v.id("academic_years") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_reports")
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get reports by generator
export const getByGenerator = query({
  args: { generatedBy: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_reports")
      .filter((q) => q.eq(q.field("generatedBy"), args.generatedBy))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Get published reports
export const getPublishedReports = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("workload_reports")
      .filter((q) => q.eq(q.field("status"), "Published"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

// Create a new workload report
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    academicYearId: v.id("academic_years"),
    reportType: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    status: v.optional(v.string()),
    format: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    filters: v.optional(v.object({
      departments: v.optional(v.array(v.id("departments"))),
      faculties: v.optional(v.array(v.id("faculties"))),
      teams: v.optional(v.array(v.id("teams"))),
      lecturers: v.optional(v.array(v.id("lecturers"))),
      modules: v.optional(v.array(v.id("modules"))),
      allocationTypes: v.optional(v.array(v.id("allocation_types"))),
      workloadRange: v.optional(v.object({
        min: v.number(),
        max: v.number(),
      })),
    })),
    metrics: v.optional(v.object({
      totalLecturers: v.number(),
      totalModules: v.number(),
      totalAllocations: v.number(),
      totalTeachingHours: v.number(),
      totalAssessmentHours: v.number(),
      totalAdminHours: v.number(),
      averageWorkload: v.number(),
      maxWorkload: v.number(),
      minWorkload: v.number(),
    })),
    data: v.optional(v.any()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Validate dates if provided
    if (args.startDate && args.endDate) {
      if (new Date(args.startDate) >= new Date(args.endDate)) {
        throw new Error("Start date must be before end date");
      }
    }
    
    // Validate file size if provided
    if (args.fileSize !== undefined) {
      if (args.fileSize < 0) {
        throw new Error("File size cannot be negative");
      }
    }
    
    // Validate metrics if provided
    if (args.metrics) {
      const metricFields = [
        'totalLecturers', 'totalModules', 'totalAllocations',
        'totalTeachingHours', 'totalAssessmentHours', 'totalAdminHours',
        'averageWorkload', 'maxWorkload', 'minWorkload'
      ];
      
      for (const field of metricFields) {
        if ((args.metrics as any)[field] < 0) {
          throw new Error(`${field} cannot be negative`);
        }
      }
    }
    
    return await ctx.db.insert("workload_reports", {
      ...args,
      status: args.status ?? "Draft",
      format: args.format ?? "PDF",
      data: args.data ?? {},
      generatedBy: identity.subject,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a workload report
export const update = mutation({
  args: {
    id: v.id("workload_reports"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.string()),
    format: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    filters: v.optional(v.object({
      departments: v.optional(v.array(v.id("departments"))),
      faculties: v.optional(v.array(v.id("faculties"))),
      teams: v.optional(v.array(v.id("teams"))),
      lecturers: v.optional(v.array(v.id("lecturers"))),
      modules: v.optional(v.array(v.id("modules"))),
      allocationTypes: v.optional(v.array(v.id("allocation_types"))),
      workloadRange: v.optional(v.object({
        min: v.number(),
        max: v.number(),
      })),
    })),
    metrics: v.optional(v.object({
      totalLecturers: v.number(),
      totalModules: v.number(),
      totalAllocations: v.number(),
      totalTeachingHours: v.number(),
      totalAssessmentHours: v.number(),
      totalAdminHours: v.number(),
      averageWorkload: v.number(),
      maxWorkload: v.number(),
      minWorkload: v.number(),
    })),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // Validate dates if provided
    if (updates.startDate && updates.endDate) {
      if (new Date(updates.startDate) >= new Date(updates.endDate)) {
        throw new Error("Start date must be before end date");
      }
    }
    
    // Validate file size if provided
    if (updates.fileSize !== undefined) {
      if (updates.fileSize < 0) {
        throw new Error("File size cannot be negative");
      }
    }
    
    // Validate metrics if provided
    if (updates.metrics) {
      const metricFields = [
        'totalLecturers', 'totalModules', 'totalAllocations',
        'totalTeachingHours', 'totalAssessmentHours', 'totalAdminHours',
        'averageWorkload', 'maxWorkload', 'minWorkload'
      ];
      
      for (const field of metricFields) {
        if ((updates.metrics as any)[field] < 0) {
          throw new Error(`${field} cannot be negative`);
        }
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a workload report
export const remove = mutation({
  args: { id: v.id("workload_reports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get workload reports with full relationship information
export const getAllWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const reports = await ctx.db
      .query("workload_reports")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
    
    // Fetch related information for each report
    const reportsWithRelations = await Promise.all(
      reports.map(async (report) => {
        let academicYear = null;
        if (report.academicYearId) {
          academicYear = await ctx.db.get(report.academicYearId);
        }
        
        return {
          ...report,
          academicYear,
        };
      })
    );
    
    return reportsWithRelations;
  },
}); 