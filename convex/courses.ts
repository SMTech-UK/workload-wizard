import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all courses
export const getAll = query({
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
    
    let query = ctx.db.query("courses")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Get course by ID
export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const course = await ctx.db.get(args.id);
    if (!course) return null;
    
    // Get related modules for this course
    const courseModules = await ctx.db.query("course_modules")
      .filter(q => q.eq(q.field("courseId"), args.id))
      .collect();
    
    // Get module details for each course module
    const modulesWithDetails = await Promise.all(
      courseModules.map(async (courseModule) => {
        const module = await ctx.db.get(courseModule.moduleId);
        return {
          ...courseModule,
          module,
        };
      })
    );
    
    return {
      ...course,
      modules: modulesWithDetails,
    };
  },
});

// Create a new course
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    level: v.string(),
    credits: v.number(),
    duration: v.number(),
    facultyId: v.optional(v.id("faculties")),
    departmentId: v.optional(v.id("departments")),
    courseLeaderId: v.optional(v.id("user_profiles")),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    entryRequirements: v.optional(v.string()),
    learningOutcomes: v.optional(v.array(v.string())),
    isAccredited: v.boolean(),
    accreditationBody: v.optional(v.string()),
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
    
    // Validate input data
    if (args.credits <= 0) {
      throw new Error("Credits must be greater than 0");
    }
    
    if (args.duration <= 0) {
      throw new Error("Duration must be greater than 0");
    }
    
    // Check if course code already exists
    const existingCourse = await ctx.db.query("courses")
      .filter(q => 
        q.and(
          q.eq(q.field("code"), args.code),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingCourse) {
      throw new Error("Course code already exists");
    }
    
    const courseId = await ctx.db.insert("courses", {
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
      entityType: "courses",
      entityId: courseId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return courseId;
  },
});

// Update a course
export const update = mutation({
  args: {
    id: v.id("courses"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    level: v.optional(v.string()),
    credits: v.optional(v.number()),
    duration: v.optional(v.number()),
    facultyId: v.optional(v.id("faculties")),
    departmentId: v.optional(v.id("departments")),
    courseLeaderId: v.optional(v.id("user_profiles")),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    entryRequirements: v.optional(v.string()),
    learningOutcomes: v.optional(v.array(v.string())),
    isAccredited: v.optional(v.boolean()),
    accreditationBody: v.optional(v.string()),
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
    
    const { id, ...updates } = args;
    
    // Validate numeric inputs
    if (updates.credits !== undefined && updates.credits <= 0) {
      throw new Error("Credits must be greater than 0");
    }
    
    if (updates.duration !== undefined && updates.duration <= 0) {
      throw new Error("Duration must be greater than 0");
    }
    
    // Check if course code already exists (if being updated)
    if (updates.code) {
      const existingCourse = await ctx.db.query("courses")
        .filter(q => 
          q.and(
            q.eq(q.field("code"), updates.code),
            q.eq(q.field("organisationId"), organisation._id),
            q.neq(q.field("_id"), id)
          )
        )
        .first();
      
      if (existingCourse) {
        throw new Error("Course code already exists");
      }
    }
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "courses",
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

// Delete a course (soft delete)
export const remove = mutation({
  args: { id: v.id("courses") },
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
      isActive: false,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "delete",
      entityType: "courses",
      entityId: args.id,
      changes: { isActive: false },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return args.id;
  },
});

// Add module to course
export const addModule = mutation({
  args: {
    courseId: v.id("courses"),
    moduleId: v.id("modules"),
    yearOfStudy: v.number(),
    isCore: v.boolean(),
    isOptional: v.boolean(),
    order: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.id("modules"))),
    coRequisites: v.optional(v.array(v.id("modules"))),
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
    
    // Check if module is already in this course
    const existingCourseModule = await ctx.db.query("course_modules")
      .filter(q => 
        q.and(
          q.eq(q.field("courseId"), args.courseId),
          q.eq(q.field("moduleId"), args.moduleId)
        )
      )
      .first();
    
    if (existingCourseModule) {
      throw new Error("Module is already in this course");
    }
    
    const courseModuleId = await ctx.db.insert("course_modules", {
      courseId: args.courseId,
      moduleId: args.moduleId,
      yearOfStudy: args.yearOfStudy,
      isCore: args.isCore,
      isOptional: args.isOptional,
      order: args.order ?? 1,
      prerequisites: args.prerequisites,
      coRequisites: args.coRequisites,
      isActive: true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "course_modules",
      entityId: courseModuleId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return courseModuleId;
  },
});

// Remove module from course
export const removeModule = mutation({
  args: {
    courseId: v.id("courses"),
    moduleId: v.id("modules"),
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
    
    // Find the course module relationship
    const courseModule = await ctx.db.query("course_modules")
      .filter(q => 
        q.and(
          q.eq(q.field("courseId"), args.courseId),
          q.eq(q.field("moduleId"), args.moduleId)
        )
      )
      .first();
    
    if (!courseModule) {
      throw new Error("Module is not in this course");
    }
    
    await ctx.db.delete(courseModule._id);
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "delete",
      entityType: "course_modules",
      entityId: courseModule._id,
      changes: { courseId: args.courseId, moduleId: args.moduleId },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return courseModule._id;
  },
});

// Get courses by department
export const getByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("courses")
      .filter(q => q.eq(q.field("departmentId"), args.departmentId))
      .collect();
  },
});

// Get courses by faculty
export const getByFaculty = query({
  args: { facultyId: v.id("faculties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("courses")
      .filter(q => q.eq(q.field("facultyId"), args.facultyId))
      .collect();
  },
});

// Bulk import courses
export const bulkImport = mutation({
  args: {
    courses: v.array(
      v.object({
        name: v.string(),
        code: v.string(),
        description: v.optional(v.string()),
        level: v.string(),
        credits: v.number(),
        duration: v.number(),
        facultyId: v.optional(v.id("faculties")),
        departmentId: v.optional(v.id("departments")),
        courseLeaderId: v.optional(v.id("user_profiles")),
        contactEmail: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        website: v.optional(v.string()),
        entryRequirements: v.optional(v.string()),
        learningOutcomes: v.optional(v.array(v.string())),
        isAccredited: v.boolean(),
        accreditationBody: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
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
    for (const courseData of args.courses) {
      try {
        // Validate input data
        if (courseData.credits <= 0) {
          throw new Error("Credits must be greater than 0");
        }
        
        if (courseData.duration <= 0) {
          throw new Error("Duration must be greater than 0");
        }
        
        // Check if course code already exists
        const existingCourse = await ctx.db.query("courses")
          .filter(q => 
            q.and(
              q.eq(q.field("code"), courseData.code),
              q.eq(q.field("organisationId"), organisation._id)
            )
          )
          .first();
        
        if (existingCourse) {
          throw new Error(`Course code ${courseData.code} already exists`);
        }
        
        const courseId = await ctx.db.insert("courses", {
          ...courseData,
          isActive: courseData.isActive ?? true,
          organisationId: organisation._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        results.push({ success: true, id: courseId, code: courseData.code });
      } catch (error) {
        results.push({ success: false, code: courseData.code, error: String(error) });
      }
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "bulk_import",
      entityType: "courses",
      entityId: "bulk",
      changes: { 
        total: args.courses.length,
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