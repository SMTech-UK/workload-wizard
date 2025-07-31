import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Define the table schema
export default {
  // Core iteration info
  moduleId: v.id("modules"), // Reference to the module
  academicYearId: v.id("academic_years"), // Reference to academic year
  semesterPeriodId: v.optional(v.id("semester_periods")), // Reference to semester period
  
  // Iteration details
  iterationCode: v.string(), // Unique code for this iteration (e.g., "CS101-2024-S1")
  title: v.string(),
  description: v.optional(v.string()),
  
  // Delivery information
  deliveryMode: v.string(), // "face_to_face", "online", "hybrid", "blended"
  deliveryLocation: v.optional(v.string()),
  virtualRoomUrl: v.optional(v.string()),
  
  // Enrollment and capacity
  expectedEnrollment: v.number(),
  actualEnrollment: v.optional(v.number()),
  maxEnrollment: v.optional(v.number()),
  isFull: v.optional(v.boolean()),
  
  // Timing
  startDate: v.number(),
  endDate: v.number(),
  teachingStartDate: v.optional(v.number()),
  teachingEndDate: v.optional(v.number()),
  
  // Status and workflow
  status: v.string(), // "planned", "confirmed", "active", "completed", "cancelled"
  isActive: v.boolean(),
  
  // Notes and metadata
  notes: v.optional(v.string()),
  metadata: v.optional(v.any()),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
};

// Query to get all module iterations
export const getAll = query({
  args: {
    academicYearId: v.optional(v.id("academic_years")),
    moduleId: v.optional(v.id("modules")),
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    let query = ctx.db.query("module_iterations");
    
    if (args.academicYearId) {
      query = query.filter((q) => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    if (args.moduleId) {
      query = query.filter((q) => q.eq(q.field("moduleId"), args.moduleId));
    }
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Query to get module iterations by module code
export const getByModuleCode = query({
  args: { moduleCode: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // First get the module profile by code
    const moduleProfile = await ctx.db.query("module_profiles")
      .filter(q => q.eq(q.field("code"), args.moduleCode))
      .first();
    
    if (!moduleProfile) return [];
    
    // Then get all modules for this profile
    const modules = await ctx.db.query("modules")
      .filter(q => q.eq(q.field("profileId"), moduleProfile._id))
      .collect();
    
    // Finally get all iterations for these modules
    const moduleIds = modules.map(m => m._id);
    const iterations = await ctx.db.query("module_iterations")
      .filter(q => q.inArray(q.field("moduleId"), moduleIds))
      .collect();
    
    return iterations;
  },
});

// Query to get a single module iteration by ID
export const getById = query({
  args: { id: v.id("module_iterations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const iteration = await ctx.db.get(args.id);
    if (!iteration) return null;
    
    // Get related data
    const [module, academicYear, semesterPeriod] = await Promise.all([
      ctx.db.get(iteration.moduleId),
      ctx.db.get(iteration.academicYearId),
      iteration.semesterPeriodId ? ctx.db.get(iteration.semesterPeriodId) : null,
    ]);
    
    return {
      ...iteration,
      module,
      academicYear,
      semesterPeriod,
    };
  },
});

// Mutation to create a new module iteration
export const createIteration = mutation({
  args: {
    moduleId: v.id("modules"),
    academicYearId: v.id("academic_years"),
    semesterPeriodId: v.optional(v.id("semester_periods")),
    iterationCode: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    deliveryMode: v.string(),
    deliveryLocation: v.optional(v.string()),
    virtualRoomUrl: v.optional(v.string()),
    expectedEnrollment: v.number(),
    maxEnrollment: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.number(),
    teachingStartDate: v.optional(v.number()),
    teachingEndDate: v.optional(v.number()),
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Validate iteration code uniqueness
    const existingIteration = await ctx.db.query("module_iterations")
      .filter(q => q.eq(q.field("iterationCode"), args.iterationCode))
      .first();
    
    if (existingIteration) {
      throw new Error("Iteration code must be unique");
    }
    
    // Validate date ranges
    if (args.startDate >= args.endDate) {
      throw new Error("Start date must be before end date");
    }
    
    if (args.teachingStartDate && args.teachingEndDate) {
      if (args.teachingStartDate >= args.teachingEndDate) {
        throw new Error("Teaching start date must be before teaching end date");
      }
      if (args.teachingStartDate < args.startDate || args.teachingEndDate > args.endDate) {
        throw new Error("Teaching dates must be within iteration date range");
      }
    }
    
    // Validate enrollment
    if (args.maxEnrollment && args.expectedEnrollment > args.maxEnrollment) {
      throw new Error("Expected enrollment cannot exceed maximum enrollment");
    }
    
    return await ctx.db.insert("module_iterations", {
      ...args,
      actualEnrollment: 0,
      isFull: args.maxEnrollment ? args.expectedEnrollment >= args.maxEnrollment : false,
      status: args.status || "planned",
      isActive: args.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mutation to update a module iteration
export const updateIteration = mutation({
  args: {
    id: v.id("module_iterations"),
    semesterPeriodId: v.optional(v.id("semester_periods")),
    iterationCode: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    deliveryMode: v.optional(v.string()),
    deliveryLocation: v.optional(v.string()),
    virtualRoomUrl: v.optional(v.string()),
    expectedEnrollment: v.optional(v.number()),
    actualEnrollment: v.optional(v.number()),
    maxEnrollment: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    teachingStartDate: v.optional(v.number()),
    teachingEndDate: v.optional(v.number()),
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updateData } = args;
    
    // Validate iteration code uniqueness if being updated
    if (updateData.iterationCode) {
      const existingIteration = await ctx.db.query("module_iterations")
        .filter(q => 
          q.and(
            q.eq(q.field("iterationCode"), updateData.iterationCode),
            q.neq(q.field("_id"), id)
          )
        )
        .first();
      
      if (existingIteration) {
        throw new Error("Iteration code must be unique");
      }
    }
    
    // Validate date ranges if dates are being updated
    if (updateData.startDate !== undefined || updateData.endDate !== undefined) {
      const currentIteration = await ctx.db.get(id);
      if (currentIteration) {
        const startDate = updateData.startDate ?? currentIteration.startDate;
        const endDate = updateData.endDate ?? currentIteration.endDate;
        
        if (startDate >= endDate) {
          throw new Error("Start date must be before end date");
        }
      }
    }
    
    if (updateData.teachingStartDate !== undefined || updateData.teachingEndDate !== undefined) {
      const currentIteration = await ctx.db.get(id);
      if (currentIteration) {
        const teachingStartDate = updateData.teachingStartDate ?? currentIteration.teachingStartDate;
        const teachingEndDate = updateData.teachingEndDate ?? currentIteration.teachingEndDate;
        const startDate = updateData.startDate ?? currentIteration.startDate;
        const endDate = updateData.endDate ?? currentIteration.endDate;
        
        if (teachingStartDate && teachingEndDate) {
          if (teachingStartDate >= teachingEndDate) {
            throw new Error("Teaching start date must be before teaching end date");
          }
          if (teachingStartDate < startDate || teachingEndDate > endDate) {
            throw new Error("Teaching dates must be within iteration date range");
          }
        }
      }
    }
    
    // Update isFull status if enrollment data changed
    if (updateData.expectedEnrollment !== undefined || updateData.actualEnrollment !== undefined || updateData.maxEnrollment !== undefined) {
      const currentIteration = await ctx.db.get(id);
      if (currentIteration) {
        const expectedEnrollment = updateData.expectedEnrollment ?? currentIteration.expectedEnrollment;
        const actualEnrollment = updateData.actualEnrollment ?? currentIteration.actualEnrollment;
        const maxEnrollment = updateData.maxEnrollment ?? currentIteration.maxEnrollment;
        
        updateData.isFull = maxEnrollment ? (actualEnrollment || expectedEnrollment) >= maxEnrollment : false;
      }
    }
    
    return await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to delete a module iteration (soft delete)
export const deleteIteration = mutation({
  args: { id: v.id("module_iterations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Soft delete
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// NEW: Batch save all module allocations
export const batchSaveAllocations = mutation({
  args: {
    allocations: v.array(
      v.object({
        moduleIterationId: v.id("module_iterations"),
        assignedLecturerIds: v.array(v.string()),
        assignedStatus: v.string(),
      })
    ),
    lecturerUpdates: v.array(
      v.object({
        lecturerId: v.id("lecturers"),
        allocatedTeachingHours: v.number(),
        totalAllocated: v.number(),
        teachingAvailability: v.number(),
        capacity: v.number(),
      })
    ),
    moduleAllocations: v.array(
      v.object({
        lecturerId: v.id("lecturers"),
        moduleCode: v.string(),
        moduleName: v.string(),
        hoursAllocated: v.number(),
        type: v.string(),
        semester: v.string(),
        groupNumber: v.number(),
        siteName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Update module iterations with new assigned lecturers
    for (const allocation of args.allocations) {
      // Validate and clean the data
      const validLecturerIds = Array.isArray(allocation.assignedLecturerIds) 
        ? allocation.assignedLecturerIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
        : [];
      
      try {
        await ctx.db.patch(allocation.moduleIterationId, {
          assignedLecturerIds: validLecturerIds,
          assignedStatus: allocation.assignedStatus || "unassigned",
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error('Error updating allocation:', error);
        throw error;
      }
    }

    // Update lecturers with new allocation data
    for (const lecturerUpdate of args.lecturerUpdates) {
      await ctx.db.patch(lecturerUpdate.lecturerId, {
        allocatedTeachingHours: lecturerUpdate.allocatedTeachingHours,
        totalAllocated: lecturerUpdate.totalAllocated,
        teachingAvailability: lecturerUpdate.teachingAvailability,
        capacity: lecturerUpdate.capacity,
        updatedAt: Date.now(),
      });
    }

    // Clear existing module allocations
    const existingAllocations = await ctx.db.query("module_allocations").collect();
    for (const alloc of existingAllocations) {
      await ctx.db.delete(alloc._id);
    }

    // Insert new module allocations
    for (const moduleAllocation of args.moduleAllocations) {
      await ctx.db.insert("module_allocations", {
        lecturerId: moduleAllocation.lecturerId,
        moduleCode: moduleAllocation.moduleCode,
        moduleName: moduleAllocation.moduleName,
        hoursAllocated: moduleAllocation.hoursAllocated,
        type: moduleAllocation.type,
        semester: moduleAllocation.semester,
        groupNumber: moduleAllocation.groupNumber,
        siteName: moduleAllocation.siteName,
      });
    }
  },
});

// Mutation to bulk import module iterations
export const bulkImport = mutation({
  args: {
    iterations: v.array(
      v.object({
        moduleId: v.id("modules"),
        academicYearId: v.id("academic_years"),
        semesterPeriodId: v.optional(v.id("semester_periods")),
        iterationCode: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        deliveryMode: v.string(),
        deliveryLocation: v.optional(v.string()),
        virtualRoomUrl: v.optional(v.string()),
        expectedEnrollment: v.number(),
        maxEnrollment: v.optional(v.number()),
        startDate: v.number(),
        endDate: v.number(),
        teachingStartDate: v.optional(v.number()),
        teachingEndDate: v.optional(v.number()),
        status: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const results = [];
    for (const iterationData of args.iterations) {
      try {
        // Set default values for optional fields
        const dataToInsert = {
          ...iterationData,
          actualEnrollment: 0,
          isFull: iterationData.maxEnrollment ? iterationData.expectedEnrollment >= iterationData.maxEnrollment : false,
          status: iterationData.status || "planned",
          isActive: iterationData.isActive ?? true,
        };
        
        const iterationId = await ctx.db.insert("module_iterations", {
          ...dataToInsert,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.push({ success: true, id: iterationId, iterationCode: iterationData.iterationCode });
      } catch (error) {
        results.push({ success: false, iterationCode: iterationData.iterationCode, error: String(error) });
      }
    }
    return results;
  },
});