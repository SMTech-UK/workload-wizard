import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Define the table schema
export default {
  moduleCode: v.string(),
  title: v.string(),
  semester: v.float64(),
  cohortId: v.string(),
  teachingStartDate: v.string(),
  teachingHours: v.float64(),
  markingHours: v.float64(),
  assignedLecturerId: v.string(),
  assignedLecturerIds: v.array(v.id("lecturers")),
  assignedStatus: v.string(),
  notes: v.string(),
  academicYearId: v.optional(v.id("academic_years")), // Reference to academic year
  assessments: v.array(
    v.object({
      title: v.string(),
      type: v.string(),
      weighting: v.float64(),
      submissionDate: v.string(),
      marksDueDate: v.string(),
      isSecondAttempt: v.boolean(),
      externalExaminerRequired: v.boolean(),
      alertsToTeam: v.boolean(),
    })
  ),
  sites: v.array(
    v.object({
      name: v.string(),
      deliveryTime: v.string(),
      students: v.float64(),
      groups: v.float64(),
    })
  ),
};

// Query to get all module iterations
export const getAll = query({
  args: {
    academicYearId: v.optional(v.id("academic_years")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    if (args.academicYearId) {
      return await ctx.db.query("module_iterations")
        .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
        .collect();
    }
    
    return await ctx.db.query("module_iterations").collect();
  },
});

// Query to get module iterations by module code
export const getByModuleCode = query({
  args: { moduleCode: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iterations")
      .filter((q) => q.eq(q.field("moduleCode"), args.moduleCode))
      .collect();
  },
});

// Query to get a single module iteration by ID
export const getById = query({
  args: { id: v.id("module_iterations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.get(args.id);
  },
});

// Mutation to create a new module iteration
export const createIteration = mutation({
  args: {
    moduleCode: v.string(),
    title: v.string(),
    semester: v.float64(),
    cohortId: v.string(),
    teachingStartDate: v.string(),
    teachingHours: v.float64(),
    markingHours: v.float64(),
    assignedLecturerId: v.string(),
    assignedLecturerIds: v.array(v.id("lecturers")),
    assignedStatus: v.string(),
    notes: v.string(),
    academicYearId: v.optional(v.id("academic_years")),
    assessments: v.array(
      v.object({
        title: v.string(),
        type: v.string(),
        weighting: v.float64(),
        submissionDate: v.string(),
        marksDueDate: v.string(),
        isSecondAttempt: v.boolean(),
        externalExaminerRequired: v.boolean(),
        alertsToTeam: v.boolean(),
      })
    ),
    sites: v.array(
      v.object({
        name: v.string(),
        deliveryTime: v.string(),
        students: v.float64(),
        groups: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.insert("module_iterations", args);
  },
});

// Mutation to update a module iteration
export const updateIteration = mutation({
  args: {
    id: v.id("module_iterations"),
    moduleCode: v.string(),
    title: v.string(),
    semester: v.float64(),
    cohortId: v.string(),
    teachingStartDate: v.string(),
    teachingHours: v.float64(),
    markingHours: v.float64(),
    assignedLecturerId: v.string(),
    assignedLecturerIds: v.array(v.string()),
    assignedStatus: v.string(),
    notes: v.string(),
    assessments: v.array(
      v.object({
        title: v.string(),
        type: v.string(),
        weighting: v.float64(),
        submissionDate: v.string(),
        marksDueDate: v.string(),
        isSecondAttempt: v.boolean(),
        externalExaminerRequired: v.boolean(),
        alertsToTeam: v.boolean(),
      })
    ),
    sites: v.array(
      v.object({
        name: v.string(),
        deliveryTime: v.string(),
        students: v.float64(),
        groups: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    console.log('updateIteration called with args:', JSON.stringify(args, null, 2));
    
    const { id, ...updateData } = args;
    
    // Validate the data before updating
    if (!updateData.moduleCode || !updateData.title || !updateData.cohortId || !updateData.teachingStartDate) {
      throw new Error("Missing required fields for module iteration update");
    }
    
    // Ensure assignedLecturerIds is always an array
    if (!Array.isArray(updateData.assignedLecturerIds)) {
      updateData.assignedLecturerIds = [];
    }
    
    // Filter out any invalid IDs
    updateData.assignedLecturerIds = updateData.assignedLecturerIds.filter(id => id && typeof id === 'string' && id.trim() !== '');
    
    // Ensure other arrays are properly initialized
    if (!Array.isArray(updateData.assessments)) {
      updateData.assessments = [];
    }
    if (!Array.isArray(updateData.sites)) {
      updateData.sites = [];
    }
    
    // Ensure string fields are not undefined
    updateData.notes = updateData.notes || "";
    updateData.assignedLecturerId = updateData.assignedLecturerId || "";
    updateData.assignedStatus = updateData.assignedStatus || "unassigned";
    
    try {
      return await ctx.db.patch(id, updateData);
    } catch (error) {
      console.error('Error updating module iteration:', error);
      console.error('Data that caused error:', JSON.stringify(updateData, null, 2));
      throw error;
    }
  },
});

// Mutation to delete a module iteration
export const deleteIteration = mutation({
  args: { id: v.id("module_iterations") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
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
    
    console.log('batchSaveAllocations called with args:', JSON.stringify(args, null, 2));
    
    // Update module iterations with new assigned lecturers
    for (const allocation of args.allocations) {
      console.log('Updating allocation:', allocation);
      
      // Validate and clean the data
      const validLecturerIds = Array.isArray(allocation.assignedLecturerIds) 
        ? allocation.assignedLecturerIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
        : [];
      
      try {
        await ctx.db.patch(allocation.moduleIterationId, {
          assignedLecturerIds: validLecturerIds,
          assignedStatus: allocation.assignedStatus || "unassigned",
        });
      } catch (error) {
        console.error('Error updating allocation:', error);
        console.error('Allocation data that caused error:', JSON.stringify(allocation, null, 2));
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
        moduleCode: v.string(),
        title: v.string(),
        semester: v.float64(),
        cohortId: v.string(),
        teachingStartDate: v.string(),
        teachingHours: v.float64(),
        markingHours: v.float64(),
        assignedLecturerId: v.optional(v.string()),
        assignedLecturerIds: v.optional(v.array(v.id("lecturers"))),
        assignedStatus: v.optional(v.string()),
        notes: v.optional(v.string()),
        assessments: v.optional(v.array(
          v.object({
            title: v.string(),
            type: v.string(),
            weighting: v.number(),
            submissionDate: v.string(),
            marksDueDate: v.string(),
            isSecondAttempt: v.boolean(),
            externalExaminerRequired: v.boolean(),
            alertsToTeam: v.boolean(),
          })
        )),
        sites: v.optional(v.array(
          v.object({
            name: v.string(),
            deliveryTime: v.string(),
            students: v.number(),
            groups: v.number(),
          })
        )),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const iterationData of args.iterations) {
      try {
        // Set default values for optional fields
        const dataToInsert = {
          ...iterationData,
          assignedLecturerId: iterationData.assignedLecturerId || "",
          assignedLecturerIds: iterationData.assignedLecturerIds || [],
          assignedStatus: iterationData.assignedStatus || "unassigned",
          notes: iterationData.notes || "",
          assessments: iterationData.assessments || [],
          sites: iterationData.sites || [],
        };
        
        const iterationId = await ctx.db.insert("module_iterations", dataToInsert);
        results.push({ success: true, id: iterationId, moduleCode: iterationData.moduleCode });
      } catch (error) {
        results.push({ success: false, moduleCode: iterationData.moduleCode, error: String(error) });
      }
    }
    return results;
  },
});