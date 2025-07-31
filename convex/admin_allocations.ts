import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import Calculator from "@/lib/calculator";

export default {
  // Core allocation info
  lecturerId: v.id("lecturers"),
  academicYearId: v.id("academic_years"),
  
  // Allocation details
  allocationTypeId: v.optional(v.id("allocation_types")), // Reference to allocation type
  category: v.string(), // "teaching", "research", "admin", "service", "other"
  title: v.string(),
  description: v.optional(v.string()),
  
  // Time allocation
  hours: v.number(),
  hoursPerWeek: v.optional(v.number()),
  weeksPerYear: v.optional(v.number()),
  
  // Period and timing
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  isRecurring: v.optional(v.boolean()),
  recurrencePattern: v.optional(v.string()), // "weekly", "monthly", "yearly"
  
  // Status and workflow
  status: v.string(), // "planned", "active", "completed", "cancelled"
  isActive: v.boolean(),
  isApproved: v.optional(v.boolean()),
  approvedBy: v.optional(v.string()), // User ID
  approvedAt: v.optional(v.number()),
  
  // Priority and importance
  priority: v.string(), // "low", "normal", "high", "urgent"
  isEssential: v.optional(v.boolean()),
  
  // Notes and metadata
  notes: v.optional(v.string()),
  metadata: v.optional(v.any()),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
};

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
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.string()),
    isEssential: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Validate hours
    if (args.hours <= 0) {
      throw new Error("Hours must be greater than 0");
    }
    
    // Validate date range if provided
    if (args.startDate && args.endDate && args.startDate >= args.endDate) {
      throw new Error("Start date must be before end date");
    }
    
    const allocationId = await ctx.db.insert("admin_allocations", {
      ...args,
      status: args.status || "planned",
      isActive: args.isActive ?? true,
      priority: args.priority || "normal",
      isEssential: args.isEssential ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update lecturer's allocated admin hours
    await updateLecturerAdminHours(ctx, args.lecturerId);
    
    return allocationId;
  },
});

export const update = mutation({
  args: {
    id: v.id("admin_allocations"),
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
    priority: v.optional(v.string()),
    isEssential: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updateData } = args;
    
    // Validate hours if being updated
    if (updateData.hours !== undefined && updateData.hours <= 0) {
      throw new Error("Hours must be greater than 0");
    }
    
    // Validate date range if dates are being updated
    if (updateData.startDate !== undefined || updateData.endDate !== undefined) {
      const currentAllocation = await ctx.db.get(id);
      if (currentAllocation) {
        const startDate = updateData.startDate ?? currentAllocation.startDate;
        const endDate = updateData.endDate ?? currentAllocation.endDate;
        
        if (startDate && endDate && startDate >= endDate) {
          throw new Error("Start date must be before end date");
        }
      }
    }
    
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    // Update lecturer's allocated admin hours
    const allocation = await ctx.db.get(id);
    if (allocation) {
      await updateLecturerAdminHours(ctx, allocation.lecturerId);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("admin_allocations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const allocation = await ctx.db.get(args.id);
    if (!allocation) throw new Error("Admin allocation not found");
    
    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update lecturer's allocated admin hours
    await updateLecturerAdminHours(ctx, allocation.lecturerId);
  },
});

export const setForLecturer = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    academicYearId: v.id("academic_years"),
    adminAllocations: v.array(v.object({
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
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      isEssential: v.optional(v.boolean()),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Remove existing allocations for this lecturer and academic year
    const existing = await ctx.db.query("admin_allocations")
      .filter(q => 
        q.and(
          q.eq(q.field("lecturerId"), args.lecturerId),
          q.eq(q.field("academicYearId"), args.academicYearId)
        )
      )
      .collect();
    
    for (const alloc of existing) {
      await ctx.db.patch(alloc._id, {
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Insert new allocations
    const allocationIds = [];
    for (const alloc of args.adminAllocations) {
      const allocationId = await ctx.db.insert("admin_allocations", {
        lecturerId: args.lecturerId,
        academicYearId: args.academicYearId,
        ...alloc,
        status: alloc.status || "planned",
        isActive: true,
        priority: alloc.priority || "normal",
        isEssential: alloc.isEssential ?? false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      allocationIds.push(allocationId);
    }
    
    // Update lecturer's allocated admin hours
    await updateLecturerAdminHours(ctx, args.lecturerId);
    
    return allocationIds;
  },
});

// Helper function to update lecturer's allocated admin hours
async function updateLecturerAdminHours(ctx: any, lecturerId: any) {
  // Get all active admin allocations for this lecturer
  const adminAllocations = await ctx.db.query("admin_allocations")
    .filter(q => 
      q.and(
        q.eq(q.field("lecturerId"), lecturerId),
        q.eq(q.field("isActive"), true)
      )
    )
    .collect();
  
  // Sum all hours from admin allocations
  const totalAdminHours = adminAllocations.reduce((sum, a) => sum + (a.hours || 0), 0);
  
  // Find the lecturer and update allocatedAdminHours
  const lecturer = await ctx.db.get(lecturerId);
  if (lecturer) {
    await ctx.db.patch(lecturerId, { 
      allocatedAdminHours: totalAdminHours,
      updatedAt: Date.now(),
    });
    
    // Calculate and update capacity (remaining hours)
    const totalAllocated = (lecturer.allocatedTeachingHours || 0) + totalAdminHours;
    const newCapacity = lecturer.totalContract ? lecturer.totalContract - totalAllocated : 0;
    await ctx.db.patch(lecturerId, { 
      capacity: newCapacity,
      totalAllocated,
      updatedAt: Date.now(),
    });
  }
}