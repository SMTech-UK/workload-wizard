import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

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
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    let query = ctx.db.query("module_iterations")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
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
    
    const iterations = await query.collect();
    
    // Join with module and module profile data
    const iterationsWithModuleData = await Promise.all(
      iterations.map(async (iteration) => {
        // Get the module
        const module = await ctx.db.get(iteration.moduleId);
        if (!module) {
          return {
            ...iteration,
            moduleCode: "Unknown",
            title: "Unknown Module",
            semester: 1,
            cohortId: "",
            teachingStartDate: "",
            teachingHours: 0,
            markingHours: 0,
            assignedLecturerIds: [],
            assignedStatus: "unassigned",
            assessments: [],
            sites: [],
          };
        }
        
        // Get the module profile
        const moduleProfile = await ctx.db.get(module.profileId);
        if (!moduleProfile) {
          return {
            ...iteration,
            moduleCode: "Unknown",
            title: "Unknown Module",
            semester: 1,
            cohortId: "",
            teachingStartDate: "",
            teachingHours: 0,
            markingHours: 0,
            assignedLecturerIds: [],
            assignedStatus: "unassigned",
            assessments: [],
            sites: [],
          };
        }
        
        // Get assessments for this iteration
        const assessments = await ctx.db.query("module_iteration_assessments")
          .filter(q => q.eq(q.field("moduleIterationId"), iteration._id))
          .collect();
        
        // Get groups for this iteration
        const groups = await ctx.db.query("module_iteration_groups")
          .filter(q => q.eq(q.field("moduleIterationId"), iteration._id))
          .collect();
        
        // Transform groups to sites format for backward compatibility
        const sites = groups.map(group => ({
          name: group.name,
          deliveryTime: "TBD",
          students: group.currentSize || 0,
          groups: 1, // Each group becomes a site
        }));
        
        // If no groups, create a default site
        if (sites.length === 0) {
          sites.push({
            name: "Default Site",
            deliveryTime: "TBD",
            students: iteration.expectedEnrollment || 0,
            groups: 1,
          });
        }
        
        return {
          ...iteration,
          moduleCode: moduleProfile.code,
          title: moduleProfile.title,
          semester: 1, // Default semester - this should come from cohort_module_plans
          cohortId: "", // This should come from cohort_module_plans
          teachingStartDate: iteration.teachingStartDate ? new Date(iteration.teachingStartDate).toISOString() : "",
          teachingHours: moduleProfile.defaultTeachingHours,
          markingHours: moduleProfile.defaultMarkingHours,
          assignedLecturerIds: [], // This should come from module_allocations
          assignedStatus: "unassigned",
          assessments: assessments.map(assessment => ({
            title: assessment.title,
            type: assessment.type,
            weighting: assessment.weighting,
            submissionDate: assessment.submissionDate,
            marksDueDate: assessment.marksDueDate,
            isSecondAttempt: assessment.isSecondAttempt,
            externalExaminerRequired: assessment.externalExaminerRequired,
            alertsToTeam: assessment.alertsToTeam,
          })),
          sites,
        };
      })
    );
    
    return iterationsWithModuleData;
  },
});

// Query to get module iterations by module code
export const getByModuleCode = query({
  args: { moduleCode: v.string() },
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
    
    // First get the module profile by code
    let moduleProfileQuery = ctx.db.query("module_profiles")
      .filter(q => q.eq(q.field("code"), args.moduleCode))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const moduleProfile = await moduleProfileQuery.first();
    
    if (!moduleProfile) return [];
    
    // Then get all modules for this profile
    let modulesQuery = ctx.db.query("modules")
      .filter(q => q.eq(q.field("profileId"), moduleProfile._id))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const modules = await modulesQuery.collect();
    
    // Finally get all iterations for these modules
    const moduleIds = modules.map(m => m._id);
    let iterationsQuery = ctx.db.query("module_iterations")
      .filter(q => q.neq(q.field("moduleId"), undefined))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const iterations = await iterationsQuery.collect();
    
    // Filter in memory since Convex doesn't support inArray
    return iterations.filter(iteration => moduleIds.includes(iteration.moduleId));
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
    description: v.optional(v.string()),
    deliveryMode: v.string(),
    deliveryLocation: v.optional(v.string()),
    virtualRoomUrl: v.optional(v.string()),
    expectedEnrollment: v.optional(v.number()),
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
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Validate iteration code uniqueness
    let existingQuery = ctx.db.query("module_iterations")
      .filter(q => q.eq(q.field("iterationCode"), args.iterationCode))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const existingIteration = await existingQuery.first();
    
    if (existingIteration) {
      throw new Error("Iteration code must be unique");
    }
    
    // Validate date ranges
    if (args.startDate && args.endDate && args.startDate >= args.endDate) {
      throw new Error("Start date must be before end date");
    }
    
    if (args.teachingStartDate && args.teachingEndDate) {
      if (args.teachingStartDate >= args.teachingEndDate) {
        throw new Error("Teaching start date must be before teaching end date");
      }
      if (args.startDate && args.endDate && 
          (args.teachingStartDate < args.startDate || args.teachingEndDate > args.endDate)) {
        throw new Error("Teaching dates must be within iteration date range");
      }
    }
    
    // Validate enrollment
    if (args.maxEnrollment && args.expectedEnrollment && args.expectedEnrollment > args.maxEnrollment) {
      throw new Error("Expected enrollment cannot exceed maximum enrollment");
    }
    
    // Validate numeric inputs
    if (args.expectedEnrollment !== undefined && args.expectedEnrollment < 0) {
      throw new Error("Expected enrollment cannot be negative");
    }
    
    if (args.maxEnrollment !== undefined && args.maxEnrollment < 0) {
      throw new Error("Maximum enrollment cannot be negative");
    }
    
    const iterationId = await ctx.db.insert("module_iterations", {
      ...args,
      deliveryLocation: args.deliveryLocation || "TBD",
      actualEnrollment: 0,
      isFull: args.maxEnrollment && args.expectedEnrollment ? args.expectedEnrollment >= args.maxEnrollment : false,
      status: args.status || "planned",
      isActive: true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "module_iterations",
      entityId: iterationId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return iterationId;
  },
});

// Mutation to update a module iteration
export const updateIteration = mutation({
  args: {
    id: v.id("module_iterations"),
    semesterPeriodId: v.optional(v.id("semester_periods")),
    iterationCode: v.optional(v.string()),
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
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Validate iteration code uniqueness if being updated
    if (updateData.iterationCode) {
      let existingQuery = ctx.db.query("module_iterations")
        .filter(q => 
          q.and(
            q.eq(q.field("iterationCode"), updateData.iterationCode),
            q.neq(q.field("_id"), id),
            q.eq(q.field("organisationId"), organisation._id)
          )
        );
      
      const existingIteration = await existingQuery.first();
      
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
        
        if (startDate && endDate && startDate >= endDate) {
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
          if (startDate && endDate && teachingStartDate && teachingEndDate && 
              (teachingStartDate < startDate || teachingEndDate > endDate)) {
            throw new Error("Teaching dates must be within iteration date range");
          }
        }
      }
    }
    
    // Validate numeric inputs
    if (updateData.expectedEnrollment !== undefined && updateData.expectedEnrollment < 0) {
      throw new Error("Expected enrollment cannot be negative");
    }
    
    if (updateData.actualEnrollment !== undefined && updateData.actualEnrollment < 0) {
      throw new Error("Actual enrollment cannot be negative");
    }
    
    if (updateData.maxEnrollment !== undefined && updateData.maxEnrollment < 0) {
      throw new Error("Maximum enrollment cannot be negative");
    }
    
    // Update isFull status if enrollment data changed
    if (updateData.expectedEnrollment !== undefined || updateData.actualEnrollment !== undefined || updateData.maxEnrollment !== undefined) {
      const currentIteration = await ctx.db.get(id);
      if (currentIteration) {
        const expectedEnrollment = updateData.expectedEnrollment ?? currentIteration?.expectedEnrollment ?? 0;
        const actualEnrollment = updateData.actualEnrollment ?? currentIteration?.actualEnrollment ?? 0;
        const maxEnrollment = updateData.maxEnrollment ?? currentIteration?.maxEnrollment;
        
        if (updateData && currentIteration) {
          (updateData as any).isFull = maxEnrollment ? (actualEnrollment || expectedEnrollment) >= maxEnrollment : false;
        }
      }
    }
    
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "module_iterations",
      entityId: id,
      changes: updateData,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return id;
  },
});

// Mutation to delete a module iteration (soft delete)
export const deleteIteration = mutation({
  args: { id: v.id("module_iterations") },
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
    
    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "delete",
      entityType: "module_iterations",
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

// Batch save all module allocations
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
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    // Validate input data
    for (const lecturerUpdate of args.lecturerUpdates) {
      if (lecturerUpdate.allocatedTeachingHours < 0) {
        throw new Error("Allocated teaching hours cannot be negative");
      }
      
      if (lecturerUpdate.totalAllocated < 0) {
        throw new Error("Total allocated hours cannot be negative");
      }
      
      if (lecturerUpdate.teachingAvailability < 0) {
        throw new Error("Teaching availability cannot be negative");
      }
    }
    
    for (const moduleAllocation of args.moduleAllocations) {
      if (moduleAllocation.hoursAllocated < 0) {
        throw new Error("Hours allocated cannot be negative");
      }
      
      if (moduleAllocation.groupNumber < 1) {
        throw new Error("Group number must be at least 1");
      }
    }
    
    // Update module iterations with new assigned lecturers
    for (const allocation of args.allocations) {
      // Validate and clean the data
      const validLecturerIds = Array.isArray(allocation.assignedLecturerIds) 
        ? allocation.assignedLecturerIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
        : [];
      
      try {
        await ctx.db.patch(allocation.moduleIterationId, {
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
        updatedAt: Date.now(),
      });
    }

    // Clear existing module allocations
    let existingAllocationsQuery = ctx.db.query("module_allocations")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const existingAllocations = await existingAllocationsQuery.collect();
    
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
        isActive: true,
        organisationId: organisation._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "batch_update",
      entityType: "module_allocations",
      entityId: "batch",
      changes: { 
        allocations: args.allocations.length,
        lecturerUpdates: args.lecturerUpdates.length,
        moduleAllocations: args.moduleAllocations.length 
      },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
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
        description: v.optional(v.string()),
        deliveryMode: v.string(),
        deliveryLocation: v.optional(v.string()),
        virtualRoomUrl: v.optional(v.string()),
        expectedEnrollment: v.optional(v.number()),
        maxEnrollment: v.optional(v.number()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
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
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    const results = [];
    for (const iterationData of args.iterations) {
      try {
        // Validate input data
        if (iterationData.expectedEnrollment !== undefined && iterationData.expectedEnrollment < 0) {
          throw new Error("Expected enrollment cannot be negative");
        }
        
        if (iterationData.maxEnrollment !== undefined && iterationData.maxEnrollment < 0) {
          throw new Error("Maximum enrollment cannot be negative");
        }
        
        // Validate date ranges
        if (iterationData.startDate && iterationData.endDate && iterationData.startDate >= iterationData.endDate) {
          throw new Error("Start date must be before end date");
        }
        
        if (iterationData.teachingStartDate && iterationData.teachingEndDate) {
          if (iterationData.teachingStartDate >= iterationData.teachingEndDate) {
            throw new Error("Teaching start date must be before teaching end date");
          }
          if (iterationData.startDate && iterationData.endDate && 
              (iterationData.teachingStartDate < iterationData.startDate || iterationData.teachingEndDate > iterationData.endDate)) {
            throw new Error("Teaching dates must be within iteration date range");
          }
        }
        
        // Validate enrollment
        if (iterationData.maxEnrollment && iterationData.expectedEnrollment && iterationData.expectedEnrollment > iterationData.maxEnrollment) {
          throw new Error("Expected enrollment cannot exceed maximum enrollment");
        }
        
        // Check if iteration code already exists
        const existingIteration = await ctx.db.query("module_iterations")
          .filter(q => 
            q.and(
              q.eq(q.field("iterationCode"), iterationData.iterationCode),
              q.eq(q.field("organisationId"), organisation._id)
            )
          )
          .first();
        
        if (existingIteration) {
          throw new Error(`Iteration code ${iterationData.iterationCode} already exists`);
        }
        
        // Set default values for optional fields
        const dataToInsert = {
          ...iterationData,
          actualEnrollment: 0,
          isFull: iterationData.maxEnrollment && iterationData.expectedEnrollment ? iterationData.expectedEnrollment >= iterationData.maxEnrollment : false,
          status: iterationData.status || "planned",
          isActive: iterationData.isActive ?? true,
        };
        
        const iterationId = await ctx.db.insert("module_iterations", {
          ...dataToInsert,
          deliveryLocation: dataToInsert.deliveryLocation || "TBD",
          organisationId: organisation._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.push({ success: true, id: iterationId, iterationCode: iterationData.iterationCode });
      } catch (error) {
        results.push({ success: false, iterationCode: iterationData.iterationCode, error: String(error) });
      }
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "bulk_import",
      entityType: "module_iterations",
      entityId: "bulk",
      changes: { 
        total: args.iterations.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length 
      },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return results;
  },
});

// Mutation to update module iteration assignments
export const updateIterationAssignments = mutation({
  args: {
    id: v.id("module_iterations"),
    assignedLecturerIds: v.array(v.string()),
    assignedStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updateData } = args;
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "module_iterations",
      entityId: id,
      changes: updateData,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return id;
  },
});