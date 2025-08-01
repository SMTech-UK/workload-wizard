import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {
    academicYearId: v.optional(v.id("academic_years")),
    lecturerId: v.optional(v.id("lecturers")),
    category: v.optional(v.string()),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    if (args.lecturerId) {
      query = query.filter(q => q.eq(q.field("lecturerId"), args.lecturerId));
    }
    
    if (args.category) {
      query = query.filter(q => q.eq(q.field("category"), args.category));
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

export const getByLecturer = query({
  args: { 
    lecturerId: v.id("lecturers"),
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("lecturerId"), args.lecturerId))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    return await query.collect();
  },
});

export const getById = query({
  args: { id: v.id("admin_allocations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    academicYearId: v.id("academic_years"),
    allocationTypeId: v.optional(v.id("allocation_types")),
    category: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    hours: v.number(),
    hoursPerWeek: v.optional(v.number()),
    weeksPerYear: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
    recurrencePattern: v.optional(v.string()),
    status: v.string(),
    isActive: v.boolean(),
    isApproved: v.optional(v.boolean()),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    priority: v.string(),
    isEssential: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
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
    
    // Validate input data
    if (args.hours < 0) {
      throw new Error("Hours cannot be negative");
    }
    
    if (args.hoursPerWeek !== undefined && args.hoursPerWeek < 0) {
      throw new Error("Hours per week cannot be negative");
    }
    
    if (args.weeksPerYear !== undefined && args.weeksPerYear < 0) {
      throw new Error("Weeks per year cannot be negative");
    }
    
    // Validate date ranges
    if (args.startDate && args.endDate && args.startDate >= args.endDate) {
      throw new Error("Start date must be before end date");
    }
    
    // Validate priority
    const validPriorities = ["low", "normal", "high", "critical"];
    if (!validPriorities.includes(args.priority)) {
      throw new Error("Priority must be one of: low, normal, high, critical");
    }
    
    // Validate status
    const validStatuses = ["planned", "active", "completed", "cancelled"];
    if (!validStatuses.includes(args.status)) {
      throw new Error("Status must be one of: planned, active, completed, cancelled");
    }
    
    const allocationId = await ctx.db.insert("admin_allocations", {
      ...args,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update lecturer's total admin hours
    await updateLecturerAdminHours(ctx, args.lecturerId);
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "admin_allocations",
      entityId: allocationId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return allocationId;
  },
});

export const update = mutation({
  args: {
    id: v.id("admin_allocations"),
    lecturerId: v.optional(v.id("lecturers")),
    academicYearId: v.optional(v.id("academic_years")),
    allocationTypeId: v.optional(v.id("allocation_types")),
    category: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    hours: v.optional(v.number()),
    hoursPerWeek: v.optional(v.number()),
    weeksPerYear: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
    recurrencePattern: v.optional(v.string()),
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isApproved: v.optional(v.boolean()),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    priority: v.optional(v.string()),
    isEssential: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();

    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Validate numeric inputs
    if (updates.hours !== undefined && updates.hours < 0) {
      throw new Error("Hours cannot be negative");
    }
    
    if (updates.hoursPerWeek !== undefined && updates.hoursPerWeek < 0) {
      throw new Error("Hours per week cannot be negative");
    }
    
    if (updates.weeksPerYear !== undefined && updates.weeksPerYear < 0) {
      throw new Error("Weeks per year cannot be negative");
    }
    
    // Validate date ranges
    if (updates.startDate !== undefined || updates.endDate !== undefined) {
      const currentAllocation = await ctx.db.get(id);
      if (currentAllocation) {
        const startDate = updates.startDate ?? currentAllocation.startDate;
        const endDate = updates.endDate ?? currentAllocation.endDate;
        
        if (startDate && endDate && startDate >= endDate) {
          throw new Error("Start date must be before end date");
        }
      }
    }
    
    // Validate priority
    if (updates.priority) {
      const validPriorities = ["low", "normal", "high", "critical"];
      if (!validPriorities.includes(updates.priority)) {
        throw new Error("Priority must be one of: low, normal, high, critical");
      }
    }
    
    // Validate status
    if (updates.status) {
      const validStatuses = ["planned", "active", "completed", "cancelled"];
      if (!validStatuses.includes(updates.status)) {
        throw new Error("Status must be one of: planned, active, completed, cancelled");
      }
    }
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    // Update lecturer's total admin hours if lecturerId changed
    if (updates.lecturerId) {
      await updateLecturerAdminHours(ctx, updates.lecturerId);
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "admin_allocations",
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

export const remove = mutation({
  args: { id: v.id("admin_allocations") },
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
    
    const allocation = await ctx.db.get(args.id);
    if (!allocation) throw new Error("Allocation not found");
    
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      isActive: false,
      updatedAt: Date.now(),
    });
    
    // Update lecturer's total admin hours
    await updateLecturerAdminHours(ctx, allocation.lecturerId);
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "delete",
      entityType: "admin_allocations",
      entityId: args.id,
      changes: { deletedAt: Date.now() },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return args.id;
  },
});

export const approve = mutation({
  args: { 
    id: v.id("admin_allocations"),
    approvedBy: v.string(),
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
    
    await ctx.db.patch(args.id, {
      isApproved: true,
      approvedBy: args.approvedBy,
      approvedAt: Date.now(),
      status: "active",
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "approve",
      entityType: "admin_allocations",
      entityId: args.id,
      changes: { isApproved: true, approvedBy: args.approvedBy },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return args.id;
  },
});

export const getByCategory = query({
  args: { 
    category: v.string(),
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("category"), args.category))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    return await query.collect();
  },
});

export const getByStatus = query({
  args: { 
    status: v.string(),
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("status"), args.status))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    return await query.collect();
  },
});

export const getActiveAllocations = query({
  args: { 
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isActive"), true))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    return await query.collect();
  },
});

export const getApprovedAllocations = query({
  args: { 
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isApproved"), true))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    return await query.collect();
  },
});

export const getByPriority = query({
  args: { 
    priority: v.string(),
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("priority"), args.priority))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    return await query.collect();
  },
});

export const getEssentialAllocations = query({
  args: { 
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isEssential"), true))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    return await query.collect();
  },
});

export const getRecurringAllocations = query({
  args: { 
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isRecurring"), true))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    return await query.collect();
  },
});

export const getByDateRange = query({
  args: { 
    startDate: v.number(),
    endDate: v.number(),
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => 
        q.and(
          q.gte(q.field("startDate"), args.startDate),
          q.lte(q.field("endDate"), args.endDate)
        )
      )
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    return await query.collect();
  },
});

export const getTotalHours = query({
  args: { 
    lecturerId: v.optional(v.id("lecturers")),
    academicYearId: v.optional(v.id("academic_years")),
    category: v.optional(v.string()),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isActive"), true))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.lecturerId) {
      query = query.filter(q => q.eq(q.field("lecturerId"), args.lecturerId));
    }
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    if (args.category) {
      query = query.filter(q => q.eq(q.field("category"), args.category));
    }
    
    const allocations = await query.collect();
    
    return allocations.reduce((total, allocation) => total + allocation.hours, 0);
  },
});

export const getSummary = query({
  args: { 
    academicYearId: v.optional(v.id("academic_years")),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    const allocations = await query.collect();
    
    const summary = {
      total: allocations.length,
      active: allocations.filter(a => a.isActive).length,
      approved: allocations.filter(a => a.isApproved).length,
      pending: allocations.filter(a => a.status === "planned").length,
      totalHours: allocations.reduce((total, a) => total + a.hours, 0),
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };
    
    // Group by category
    allocations.forEach(allocation => {
      summary.byCategory[allocation.category] = (summary.byCategory[allocation.category] || 0) + 1;
    });
    
    // Group by status
    allocations.forEach(allocation => {
      summary.byStatus[allocation.status] = (summary.byStatus[allocation.status] || 0) + 1;
    });
    
    // Group by priority
    allocations.forEach(allocation => {
      summary.byPriority[allocation.priority] = (summary.byPriority[allocation.priority] || 0) + 1;
    });
    
    return summary;
  },
});

// Mutation to set admin allocations for a lecturer
export const setForLecturer = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    adminAllocations: v.array(
      v.object({
        category: v.string(),
        description: v.string(),
        hours: v.number(),
        isHeader: v.optional(v.boolean()),
      })
    ),
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
    
    // Get the lecturer to find the academic year
    const lecturer = await ctx.db.get(args.lecturerId);
    if (!lecturer) throw new Error("Lecturer not found");
    
    // Validate input data
    for (const allocation of args.adminAllocations) {
      if (allocation.hours < 0) {
        throw new Error("Hours cannot be negative");
      }
    }
    
    // Remove existing allocations for this lecturer
    let existingQuery = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("lecturerId"), args.lecturerId))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const existingAllocations = await existingQuery.collect();
    
    for (const allocation of existingAllocations) {
      await ctx.db.patch(allocation._id, {
        deletedAt: Date.now(),
        isActive: false,
        updatedAt: Date.now(),
      });
    }
    
    // Create new allocations
    const allocationIds = [];
    for (const allocationData of args.adminAllocations) {
      if (!allocationData.isHeader) {
        const allocationId = await ctx.db.insert("admin_allocations", {
          lecturerId: args.lecturerId,
          academicYearId: lecturer.academicYearId,
          category: allocationData.category,
          title: allocationData.description,
          description: allocationData.description,
          hours: allocationData.hours,
          status: "active",
          isActive: true,
          priority: "normal",
          organisationId: organisation._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        allocationIds.push(allocationId);
      }
    }
    
    // Update lecturer's total admin hours
    await updateLecturerAdminHours(ctx, args.lecturerId);
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "bulk_update",
      entityType: "admin_allocations",
      entityId: args.lecturerId,
      changes: { 
        lecturerId: args.lecturerId,
        allocationsCount: allocationIds.length 
      },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return allocationIds;
  },
});

// Helper function to update lecturer's total admin hours
async function updateLecturerAdminHours(ctx: any, lecturerId: any) {
  // Get the current organisation
  const organisation = await ctx.db.query("organisations")
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .first();
  
  if (!organisation) {
    throw new Error("No active organisation found");
  }
  
  let query = ctx.db.query("admin_allocations")
    .filter((q: any) => 
      q.and(
        q.eq(q.field("lecturerId"), lecturerId),
        q.eq(q.field("isActive"), true),
        q.eq(q.field("organisationId"), organisation._id)
      )
    );
  
  const allocations = await query.collect();
  
  const totalAdminHours = allocations.reduce((total: number, allocation: any) => total + allocation.hours, 0);
  
  await ctx.db.patch(lecturerId, {
    allocatedAdminHours: totalAdminHours,
    updatedAt: Date.now(),
  });
}