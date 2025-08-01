import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all workload reports
export const getWorkloadReports = query({
  args: {
    academicYearId: v.optional(v.id("academic_years")),
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    let query = ctx.db.query("workload_reports")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    if (args.status) {
      query = query.filter(q => q.eq(q.field("status"), args.status));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Get workload report by ID
export const getWorkloadReportById = query({
  args: { id: v.id("workload_reports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Create a new workload report
export const createWorkloadReport = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    academicYearId: v.id("academic_years"),
    reportType: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    format: v.string(),
    filters: v.optional(v.any()),
    metrics: v.optional(v.any()),
    data: v.optional(v.any()),
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    const reportId = await ctx.db.insert("workload_reports", {
      name: args.name,
      description: args.description,
      academicYearId: args.academicYearId,
      reportType: args.reportType,
      startDate: args.startDate,
      endDate: args.endDate,
      format: args.format,
      filters: args.filters,
      metrics: args.metrics,
      data: args.data,
      status: args.status || "draft",
      isActive: args.isActive ?? true,
      generatedBy: identity.subject,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "workload_reports",
      entityId: reportId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return reportId;
  },
});

// Update a workload report
export const updateWorkloadReport = mutation({
  args: {
    id: v.id("workload_reports"),
    reportData: v.optional(v.any()),
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();

    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "workload_reports",
      entityId: id,
      changes: updates,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return id;
  },
});

// Get all team summaries
export const getAllTeamSummaries = query({
  args: {
    academicYearId: v.optional(v.id("academic_years")),
    teamId: v.optional(v.id("teams")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    let query = ctx.db.query("team_summaries")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    if (args.teamId) {
      query = query.filter(q => q.eq(q.field("teamId"), args.teamId));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Get team summary by ID
export const getTeamSummaryById = query({
  args: { id: v.id("team_summaries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Create or update team summary
export const upsertTeamSummary = mutation({
  args: {
    academicYearId: v.id("academic_years"),
    teamId: v.id("teams"),
    totalLecturers: v.number(),
    totalTeachingHours: v.number(),
    totalAdminHours: v.number(),
    totalOtherHours: v.number(),
    averageWorkload: v.number(),
    workloadDistribution: v.any(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Validate numeric inputs
    if (args.totalLecturers < 0) {
      throw new Error("Total lecturers cannot be negative");
    }
    
    if (args.totalTeachingHours < 0) {
      throw new Error("Total teaching hours cannot be negative");
    }
    
    if (args.totalAdminHours < 0) {
      throw new Error("Total admin hours cannot be negative");
    }
    
    if (args.totalOtherHours < 0) {
      throw new Error("Total other hours cannot be negative");
    }
    
    if (args.averageWorkload < 0) {
      throw new Error("Average workload cannot be negative");
    }
    
    // Check if team summary already exists
    const existingSummary = await ctx.db.query("team_summaries")
      .filter(q => 
        q.and(
          q.eq(q.field("academicYearId"), args.academicYearId),
          q.eq(q.field("teamId"), args.teamId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingSummary) {
      // Update existing summary
      await ctx.db.patch(existingSummary._id, {
        totalLecturers: args.totalLecturers,
        totalTeachingHours: args.totalTeachingHours,
        totalAdminHours: args.totalAdminHours,
        totalOtherHours: args.totalOtherHours,
        averageWorkload: args.averageWorkload,
        workloadDistribution: args.workloadDistribution,
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "update",
        entityType: "team_summaries",
        entityId: existingSummary._id,
        changes: args,
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        organisationId: organisation._id,
        createdAt: Date.now(),
      });
      
      return existingSummary._id;
    } else {
      // Create new summary
      const summaryId = await ctx.db.insert("team_summaries", {
        ...args,
        isActive: args.isActive ?? true,
        organisationId: organisation._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "create",
        entityType: "team_summaries",
        entityId: summaryId,
        changes: args,
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        organisationId: organisation._id,
        createdAt: Date.now(),
      });
      
      return summaryId;
    }
  },
});

// Update team summary
export const updateTeamSummary = mutation({
  args: {
    teamId: v.id("teams"),
    academicYearId: v.id("academic_years"),
    period: v.string(),
    totalLecturers: v.number(),
    totalTeachingHours: v.number(),
    totalAdminHours: v.number(),
    totalOtherHours: v.number(),
    averageWorkload: v.number(),
    averageWorkloadPerLecturer: v.number(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Check if summary already exists
    const existingSummary = await ctx.db.query("team_summaries")
      .filter(q => 
        q.and(
          q.eq(q.field("teamId"), args.teamId),
          q.eq(q.field("academicYearId"), args.academicYearId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingSummary) {
      // Update existing summary
      await ctx.db.patch(existingSummary._id, {
        period: args.period,
        totalLecturers: args.totalLecturers,
        totalTeachingHours: args.totalTeachingHours,
        totalAdminHours: args.totalAdminHours,
        totalOtherHours: args.totalOtherHours,
        averageWorkload: args.averageWorkload,
        averageWorkloadPerLecturer: args.averageWorkloadPerLecturer,
        lastCalculatedAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "update",
        entityType: "team_summaries",
        entityId: existingSummary._id,
        changes: args,
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        organisationId: organisation._id,
        createdAt: Date.now(),
      });
      
      return existingSummary._id;
    } else {
      // Create new summary
      const summaryId = await ctx.db.insert("team_summaries", {
        teamId: args.teamId,
        academicYearId: args.academicYearId,
        period: args.period,
        totalLecturers: args.totalLecturers,
        totalTeachingHours: args.totalTeachingHours,
        totalAdminHours: args.totalAdminHours,
        totalOtherHours: args.totalOtherHours,
        averageWorkload: args.averageWorkload,
        averageWorkloadPerLecturer: args.averageWorkloadPerLecturer,
        lastCalculatedAt: Date.now(),
        isActive: args.isActive ?? true,
        organisationId: organisation._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "create",
        entityType: "team_summaries",
        entityId: summaryId,
        changes: args,
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        organisationId: organisation._id,
        createdAt: Date.now(),
      });
      
      return summaryId;
    }
  },
});

// Generate workload analytics
export const generateWorkloadAnalytics = query({
  args: {
    academicYearId: v.id("academic_years"),
    teamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Get lecturers for the academic year
    let lecturersQuery = ctx.db.query("lecturers")
      .filter(q => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const lecturers = await lecturersQuery.collect();
    
    // Get admin allocations for the academic year
    let adminAllocationsQuery = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const adminAllocations = await adminAllocationsQuery.collect();
    
    // Calculate analytics
    const totalLecturers = lecturers.length;
    const totalTeachingHours = lecturers.reduce((sum, lecturer) => sum + (lecturer.allocatedTeachingHours || 0), 0);
    const totalAdminHours = adminAllocations.reduce((sum, allocation) => sum + (allocation.hours || 0), 0);
    const totalResearchHours = lecturers.reduce((sum, lecturer) => sum + (lecturer.allocatedResearchHours || 0), 0);
    const totalOtherHours = lecturers.reduce((sum, lecturer) => sum + (lecturer.allocatedOtherHours || 0), 0);
    
    const averageWorkload = totalLecturers > 0 ? (totalTeachingHours + totalAdminHours + totalResearchHours + totalOtherHours) / totalLecturers : 0;
    
    // Calculate workload distribution
    const totalHours = totalTeachingHours + totalAdminHours + totalResearchHours + totalOtherHours;
    const workloadDistribution = {
      teaching: totalHours > 0 ? (totalTeachingHours / totalHours) * 100 : 0,
      admin: totalHours > 0 ? (totalAdminHours / totalHours) * 100 : 0,
      research: totalHours > 0 ? (totalResearchHours / totalHours) * 100 : 0,
      other: totalHours > 0 ? (totalOtherHours / totalHours) * 100 : 0,
    };
    
    return {
      totalLecturers,
      totalTeachingHours,
      totalAdminHours,
      totalResearchHours,
      totalOtherHours,
      averageWorkload,
      workloadDistribution,
      academicYearId: args.academicYearId,
      teamId: args.teamId,
    };
  },
});

// Get report templates
export const getReportTemplates = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    let query = ctx.db.query("report_templates")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Create report template
export const createReportTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    template: v.any(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    const templateId = await ctx.db.insert("report_templates", {
      name: args.name,
      description: args.description,
      template: args.template,
      isActive: args.isActive ?? true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "report_templates",
      entityId: templateId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return templateId;
  },
});

// Get scheduled reports
export const getScheduledReports = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    let query = ctx.db.query("scheduled_reports")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Create scheduled report
export const createScheduledReport = mutation({
  args: {
    templateId: v.id("report_templates"),
    schedule: v.string(),
    recipients: v.array(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    const scheduledReportId = await ctx.db.insert("scheduled_reports", {
      templateId: args.templateId,
      schedule: args.schedule,
      recipients: args.recipients,
      isActive: args.isActive ?? true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "scheduled_reports",
      entityId: scheduledReportId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return scheduledReportId;
  },
}); 