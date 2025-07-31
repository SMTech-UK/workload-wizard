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
    
    let query = ctx.db.query("admin_allocations");
    
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("lecturerId"), args.lecturerId));
    
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
    
    const allocationId = await ctx.db.insert("admin_allocations", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update lecturer's total admin hours
    await updateLecturerAdminHours(ctx, args.lecturerId);
    
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
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    // Update lecturer's total admin hours if lecturerId changed
    if (updates.lecturerId) {
      await updateLecturerAdminHours(ctx, updates.lecturerId);
    }
    
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("admin_allocations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const allocation = await ctx.db.get(args.id);
    if (!allocation) throw new Error("Allocation not found");
    
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      isActive: false,
      updatedAt: Date.now(),
    });
    
    // Update lecturer's total admin hours
    await updateLecturerAdminHours(ctx, allocation.lecturerId);
    
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
    
    await ctx.db.patch(args.id, {
      isApproved: true,
      approvedBy: args.approvedBy,
      approvedAt: Date.now(),
      status: "active",
      updatedAt: Date.now(),
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("category"), args.category));
    
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("status"), args.status));
    
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isActive"), true));
    
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isApproved"), true));
    
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("priority"), args.priority));
    
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isEssential"), true));
    
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isRecurring"), true));
    
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => 
        q.and(
          q.gte(q.field("startDate"), args.startDate),
          q.lte(q.field("endDate"), args.endDate)
        )
      );
    
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
    
    let query = ctx.db.query("admin_allocations")
      .filter(q => q.eq(q.field("isActive"), true));
    
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
    
    let query = ctx.db.query("admin_allocations");
    
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

// Helper function to update lecturer's total admin hours
async function updateLecturerAdminHours(ctx: any, lecturerId: any) {
  const allocations = await ctx.db.query("admin_allocations")
    .filter(q => 
      q.and(
        q.eq(q.field("lecturerId"), lecturerId),
        q.eq(q.field("isActive"), true)
      )
    )
    .collect();
  
  const totalAdminHours = allocations.reduce((total, allocation) => total + allocation.hours, 0);
  
  await ctx.db.patch(lecturerId, {
    allocatedAdminHours: totalAdminHours,
    updatedAt: Date.now(),
  });
}