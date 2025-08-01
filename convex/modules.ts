import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Query to get all modules with their profiles
export const getAll = query({
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
    
    let query = ctx.db.query("modules")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.academicYearId) {
      query = query.filter((q) => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }
    
    const modules = await query.collect();
    
    // Join with module profiles to get complete data
    const modulesWithProfiles = await Promise.all(
      modules.map(async (module) => {
        // Always get profile data if profileId exists
        if (module.profileId) {
          const profile = await ctx.db.get(module.profileId);
          return {
            ...module,
            // Include profile data with fallbacks
            code: profile?.code || "Unknown",
            title: profile?.title || "Unknown Module",
            credits: profile?.credits || 0,
            level: profile?.level || 0,
            moduleLeader: profile?.moduleLeader || "Unknown",
            defaultTeachingHours: profile?.defaultTeachingHours || 0,
            defaultMarkingHours: profile?.defaultMarkingHours || 0,
          };
        } else {
          // For old structure, provide default values
          return {
            ...module,
            profileId: null,
            code: "Unknown",
            title: "Unknown Module",
            credits: 0,
            level: 0,
            moduleLeader: "Unknown",
            defaultTeachingHours: 0,
            defaultMarkingHours: 0,
          };
        }
      })
    );
    
    return modulesWithProfiles;
  },
});

// Get available module profiles that aren't in a specific academic year
export const getAvailableProfiles = query({
  args: {
    academicYearId: v.id("academic_years"),
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
    
    // Get all module profiles for this organisation
    let query = ctx.db.query("module_profiles")
      .filter(q => q.eq(q.field("isActive"), true))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const allProfiles = await query.collect();
    
    // Get profiles that are already in this academic year
    let modulesQuery = ctx.db.query("modules")
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const existingModules = await modulesQuery.collect();
    
    const existingProfileIds = new Set(
      existingModules
        .filter(m => m.profileId) // Only include records with profileId
        .map(m => m.profileId)
    );
    
    // Return profiles that aren't in this academic year
    return allProfiles.filter(profile => !existingProfileIds.has(profile._id));
  },
});

// Query to get a single module by ID
export const getById = query({
  args: { id: v.id("modules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const module = await ctx.db.get(args.id);
    if (!module) return null;
    
    // Get profile data if available
    if (module.profileId) {
      const profile = await ctx.db.get(module.profileId);
      return {
        ...module,
        profile,
      };
    }
    
    return module;
  },
});

// Mutation to create a new module for a specific academic year
export const createModule = mutation({
  args: {
    profileId: v.id("module_profiles"),
    academicYearId: v.id("academic_years"),
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
    
    // Get the profile to validate it exists and belongs to this organisation
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Module profile not found");
    
    if (profile.organisationId !== organisation._id) {
      throw new Error("Module profile does not belong to this organisation");
    }
    
    // Check if module already exists for this academic year
    const existingModule = await ctx.db.query("modules")
      .filter(q => 
        q.and(
          q.eq(q.field("profileId"), args.profileId),
          q.eq(q.field("academicYearId"), args.academicYearId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingModule) {
      throw new Error("Module already exists for this academic year");
    }
    
    const moduleId = await ctx.db.insert("modules", {
      profileId: args.profileId,
      academicYearId: args.academicYearId,
      status: args.status || "active",
      isActive: args.isActive ?? true,
      notes: args.notes,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "modules",
      entityId: moduleId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return moduleId;
  },
});

// Create a new module profile and instance for a specific academic year
export const createNewModule = mutation({
  args: {
    // Profile data
    code: v.string(),
    title: v.string(),
    credits: v.number(),
    level: v.number(),
    moduleLeader: v.string(),
    defaultTeachingHours: v.number(),
    defaultMarkingHours: v.number(),
    // Academic year
    academicYearId: v.id("academic_years"),
    // Year-specific data
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
    
    // Validate input data
    if (args.credits <= 0) {
      throw new Error("Credits must be greater than 0");
    }
    
    if (args.level < 0 || args.level > 10) {
      throw new Error("Level must be between 0 and 10");
    }
    
    if (args.defaultTeachingHours < 0) {
      throw new Error("Default teaching hours cannot be negative");
    }
    
    if (args.defaultMarkingHours < 0) {
      throw new Error("Default marking hours cannot be negative");
    }
    
    // Check if module code already exists
    const existingProfile = await ctx.db.query("module_profiles")
      .filter(q => 
        q.and(
          q.eq(q.field("code"), args.code),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingProfile) {
      throw new Error("Module code already exists");
    }
    
    // Create the module profile first
    const profileId = await ctx.db.insert("module_profiles", {
      code: args.code,
      title: args.title,
      credits: args.credits,
      level: args.level,
      moduleLeader: args.moduleLeader,
      defaultTeachingHours: args.defaultTeachingHours,
      defaultMarkingHours: args.defaultMarkingHours,
      isActive: true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create the module instance for this specific academic year
    const moduleId = await ctx.db.insert("modules", {
      profileId: profileId,
      academicYearId: args.academicYearId,
      status: args.status || "active",
      isActive: args.isActive ?? true,
      notes: args.notes,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit events
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "module_profiles",
      entityId: profileId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "modules",
      entityId: moduleId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return moduleId;
  },
});

// Mutation to update a module
export const updateModule = mutation({
  args: {
    id: v.id("modules"),
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
    
    const { id, ...updateData } = args;
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "modules",
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

// Mutation to delete a module (soft delete)
export const deleteModule = mutation({
  args: { id: v.id("modules") },
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
      entityType: "modules",
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

// Mutation to create module instances for a new academic year
export const createForAcademicYear = mutation({
  args: {
    academicYearId: v.id("academic_years"),
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
    
    // Get all module profiles for this organisation
    let query = ctx.db.query("module_profiles")
      .filter(q => q.eq(q.field("isActive"), true))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const profiles = await query.collect();
    
    const results = [];
    for (const profile of profiles) {
      try {
        // Check if module already exists for this academic year
        let existingQuery = ctx.db.query("modules")
          .filter((q) => 
            q.and(
              q.eq(q.field("profileId"), profile._id),
              q.eq(q.field("academicYearId"), args.academicYearId),
              q.eq(q.field("organisationId"), organisation._id)
            )
          );
        
        const existing = await existingQuery.first();
        
        if (!existing) {
          // Create new module instance for this academic year
          const moduleId = await ctx.db.insert("modules", {
            profileId: profile._id,
            academicYearId: args.academicYearId,
            status: "active",
            isActive: true,
            organisationId: organisation._id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          results.push({ success: true, id: moduleId, code: profile.code });
        } else {
          results.push({ success: false, code: profile.code, error: "Already exists for this academic year" });
        }
      } catch (error) {
        results.push({ success: false, code: profile.code, error: String(error) });
      }
    }
    return results;
  },
});

// Add a specific module profile to an academic year
export const addProfileToAcademicYear = mutation({
  args: {
    profileId: v.id("module_profiles"),
    academicYearId: v.id("academic_years"),
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
    
    // Check if module already exists for this academic year
    let existingQuery = ctx.db.query("modules")
      .filter((q) => 
        q.and(
          q.eq(q.field("profileId"), args.profileId),
          q.eq(q.field("academicYearId"), args.academicYearId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      );
    
    const existing = await existingQuery.first();
    
    if (existing) {
      throw new Error("Module already exists for this academic year");
    }
    
    // Get the profile to validate it belongs to this organisation
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Module profile not found");
    
    if (profile.organisationId !== organisation._id) {
      throw new Error("Module profile does not belong to this organisation");
    }
    
    // Create new module instance for this academic year
    const moduleId = await ctx.db.insert("modules", {
      profileId: args.profileId,
      academicYearId: args.academicYearId,
      status: "active",
      isActive: true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "modules",
      entityId: moduleId,
      changes: { profileId: args.profileId, academicYearId: args.academicYearId },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return moduleId;
  },
});

// Query to get all module allocations
export const getAllAllocations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!organisation) {
      throw new Error("No active organisation found");
    }
    
    let query = ctx.db.query("module_allocations")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    return await query.collect();
  },
});

// Query to get module allocations by lecturerId
export const getByLecturerId = query({
  args: { lecturerId: v.id("lecturers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_allocations")
      .filter((q) => q.eq(q.field("lecturerId"), args.lecturerId))
      .collect();
  },
});

// Mutation to set module allocations for a lecturer
export const setForLecturer = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    moduleAllocations: v.array(
      v.object({
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
    for (const allocation of args.moduleAllocations) {
      if (allocation.hoursAllocated < 0) {
        throw new Error("Hours allocated cannot be negative");
      }
      
      if (allocation.groupNumber < 1) {
        throw new Error("Group number must be at least 1");
      }
    }
    
    // Remove existing allocations for this lecturer
    const existing = await ctx.db
      .query("module_allocations")
      .filter((q) => q.eq(q.field("lecturerId"), args.lecturerId))
      .collect();
    for (const alloc of existing) {
      await ctx.db.delete(alloc._id);
    }
    
    // Insert new allocations
    for (const alloc of args.moduleAllocations) {
      await ctx.db.insert("module_allocations", {
        lecturerId: args.lecturerId,
        ...alloc,
        isActive: true,
        organisationId: organisation._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "module_allocations",
      entityId: args.lecturerId,
      changes: { moduleAllocations: args.moduleAllocations },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

// Get module profiles
export const getProfiles = query({
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
    
    let query = ctx.db.query("module_profiles")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Update module profile
export const updateProfile = mutation({
  args: {
    id: v.id("module_profiles"),
    code: v.optional(v.string()),
    title: v.optional(v.string()),
    credits: v.optional(v.number()),
    level: v.optional(v.number()),
    moduleLeader: v.optional(v.string()),
    defaultTeachingHours: v.optional(v.number()),
    defaultMarkingHours: v.optional(v.number()),
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
    if (args.credits !== undefined && args.credits <= 0) {
      throw new Error("Credits must be greater than 0");
    }
    
    if (args.level !== undefined && (args.level < 0 || args.level > 10)) {
      throw new Error("Level must be between 0 and 10");
    }
    
    if (args.defaultTeachingHours !== undefined && args.defaultTeachingHours < 0) {
      throw new Error("Default teaching hours cannot be negative");
    }
    
    if (args.defaultMarkingHours !== undefined && args.defaultMarkingHours < 0) {
      throw new Error("Default marking hours cannot be negative");
    }
    
    // Check if module code already exists (if being updated)
    if (args.code) {
      const existingProfile = await ctx.db.query("module_profiles")
        .filter(q => 
          q.and(
            q.eq(q.field("code"), args.code),
            q.eq(q.field("organisationId"), organisation._id),
            q.neq(q.field("_id"), args.id)
          )
        )
        .first();
      
      if (existingProfile) {
        throw new Error("Module code already exists");
      }
    }
    
    const { id, ...updateData } = args;
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "module_profiles",
      entityId: id,
      changes: updateData,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

// Delete module profile (soft delete)
export const deleteProfile = mutation({
  args: { id: v.id("module_profiles") },
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
      isActive: false,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "delete",
      entityType: "module_profiles",
      entityId: args.id,
      changes: { isActive: false },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

// Mutation to bulk import modules
export const bulkImport = mutation({
  args: {
    modules: v.array(
      v.object({
        code: v.string(),
        title: v.string(),
        credits: v.number(),
        level: v.number(),
        moduleLeader: v.string(),
        defaultTeachingHours: v.number(),
        defaultMarkingHours: v.number(),
        academicYearId: v.id("academic_years"),
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
    for (const moduleData of args.modules) {
      try {
        // Validate input data
        if (moduleData.credits <= 0) {
          throw new Error("Credits must be greater than 0");
        }
        
        if (moduleData.level < 0 || moduleData.level > 10) {
          throw new Error("Level must be between 0 and 10");
        }
        
        if (moduleData.defaultTeachingHours < 0) {
          throw new Error("Default teaching hours cannot be negative");
        }
        
        if (moduleData.defaultMarkingHours < 0) {
          throw new Error("Default marking hours cannot be negative");
        }
        
        // Check if module code already exists
        const existingProfile = await ctx.db.query("module_profiles")
          .filter(q => 
            q.and(
              q.eq(q.field("code"), moduleData.code),
              q.eq(q.field("organisationId"), organisation._id)
            )
          )
          .first();
        
        if (existingProfile) {
          throw new Error(`Module code ${moduleData.code} already exists`);
        }
        
        // Create the module profile first
        const profileId = await ctx.db.insert("module_profiles", {
          code: moduleData.code,
          title: moduleData.title,
          credits: moduleData.credits,
          level: moduleData.level,
          moduleLeader: moduleData.moduleLeader,
          defaultTeachingHours: moduleData.defaultTeachingHours,
          defaultMarkingHours: moduleData.defaultMarkingHours,
          isActive: true,
          organisationId: organisation._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        // Create the module instance for this specific academic year
        const moduleId = await ctx.db.insert("modules", {
          profileId: profileId,
          academicYearId: moduleData.academicYearId,
          status: moduleData.status || "active",
          isActive: moduleData.isActive ?? true,
          notes: moduleData.notes,
          organisationId: organisation._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        results.push({ success: true, id: moduleId, code: moduleData.code });
      } catch (error) {
        results.push({ success: false, code: moduleData.code, error: String(error) });
      }
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "bulk_import",
      entityType: "modules",
      entityId: "bulk",
      changes: { 
        total: args.modules.length,
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