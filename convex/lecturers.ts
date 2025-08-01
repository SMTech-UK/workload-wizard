import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query to get all lecturers with their profiles
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
    
    let query = ctx.db.query("lecturers")
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
    
    const lecturers = await query.collect();
    
    // Join with lecturer profiles to get complete data
    const lecturersWithProfiles = await Promise.all(
      lecturers.map(async (lecturer) => {
        // Always get profile data if profileId exists
        if (lecturer.profileId) {
          const profile = await ctx.db.get(lecturer.profileId);
          return {
            ...lecturer,
            // Include profile data with fallbacks
            fullName: profile?.fullName || "Unknown",
            team: profile?.team || "Unknown",
            specialism: profile?.specialism || "Unknown",
            contract: profile?.contract || "Unknown",
            email: profile?.email || "",
            role: profile?.role || "Unknown",
            family: profile?.family || "Unknown",
            fte: profile?.fte || 1.0,
            capacity: profile?.capacity || 0,
            maxTeachingHours: profile?.maxTeachingHours || 0,
            totalContract: profile?.totalContract || 0,
          };
        } else {
          // For old structure, provide default values
          return {
            ...lecturer,
            profileId: null,
            fullName: "Unknown",
            team: "Unknown",
            specialism: "Unknown",
            contract: "Unknown",
            email: "",
            role: "Unknown",
            family: "Unknown",
            fte: 1.0,
            capacity: 0,
            maxTeachingHours: 0,
            totalContract: 0,
          };
        }
      })
    );
    
    return lecturersWithProfiles;
  },
});

// Get available lecturer profiles that aren't in a specific academic year
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
    
    // Get all lecturer profiles for this organisation
    let query = ctx.db.query("lecturer_profiles")
      .filter(q => q.eq(q.field("isActive"), true))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const allProfiles = await query.collect();
    
    // Get profiles that are already in this academic year
    let lecturersQuery = ctx.db.query("lecturers")
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const existingLecturers = await lecturersQuery.collect();
    
    const existingProfileIds = new Set(
      existingLecturers
        .filter(l => l.profileId) // Only include records with profileId
        .map(l => l.profileId)
    );
    
    // Return profiles that aren't in this academic year
    return allProfiles.filter(profile => !existingProfileIds.has(profile._id));
  },
});

// Mutation to update status
export const updateStatus = mutation({
  args: { id: v.id("lecturers"), status: v.string() },
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
      status: args.status,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "lecturers",
      entityId: args.id,
      changes: { status: args.status },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

// Mutation to create a new lecturer for a specific academic year
export const createLecturer = mutation({
  args: {
    profileId: v.id("lecturer_profiles"),
    academicYearId: v.id("academic_years"),
    status: v.optional(v.string()),
    teachingAvailability: v.optional(v.number()),
    totalAllocated: v.optional(v.number()),
    allocatedTeachingHours: v.optional(v.number()),
    allocatedAdminHours: v.optional(v.number()),
    allocatedResearchHours: v.optional(v.number()),
    allocatedOtherHours: v.optional(v.number()),
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
    
    // Get the profile to set default values
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Lecturer profile not found");
    
    // Validate that profile belongs to the same organisation
    if (profile.organisationId !== organisation._id) {
      throw new Error("Lecturer profile does not belong to this organisation");
    }
    
    // Check if lecturer already exists for this academic year
    const existingLecturer = await ctx.db.query("lecturers")
      .filter(q => 
        q.and(
          q.eq(q.field("profileId"), args.profileId),
          q.eq(q.field("academicYearId"), args.academicYearId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingLecturer) {
      throw new Error("Lecturer already exists for this academic year");
    }
    
    const lecturerId = await ctx.db.insert("lecturers", {
      profileId: args.profileId,
      academicYearId: args.academicYearId,
      status: args.status || "available",
      teachingAvailability: args.teachingAvailability ?? profile.capacity,
      totalAllocated: args.totalAllocated ?? 0,
      allocatedTeachingHours: args.allocatedTeachingHours ?? 0,
      allocatedAdminHours: args.allocatedAdminHours ?? 0,
      allocatedResearchHours: args.allocatedResearchHours ?? 0,
      allocatedOtherHours: args.allocatedOtherHours ?? 0,
      notes: args.notes,
      isActive: true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "lecturers",
      entityId: lecturerId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return lecturerId;
  },
});

// Create a new lecturer profile (not instance)
export const createNewLecturer = mutation({
  args: {
    // Profile data - include legacy fields that are still in schema
    fullName: v.string(),
    email: v.string(),
    family: v.string(),
    fte: v.number(),
    capacity: v.number(),
    maxTeachingHours: v.number(),
    totalContract: v.number(),
    // Legacy fields that are still required/optional in schema
    contract: v.string(),
    team: v.optional(v.string()),
    specialism: v.optional(v.string()),
    role: v.optional(v.string()),
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
    if (args.fte <= 0 || args.fte > 2) {
      throw new Error("FTE must be between 0 and 2");
    }
    
    if (args.capacity < 0) {
      throw new Error("Capacity cannot be negative");
    }
    
    if (args.maxTeachingHours < 0) {
      throw new Error("Maximum teaching hours cannot be negative");
    }
    
    if (args.totalContract < 0) {
      throw new Error("Total contract hours cannot be negative");
    }
    
    // Create the lecturer profile only
    const profileId = await ctx.db.insert("lecturer_profiles", {
      fullName: args.fullName,
      email: args.email,
      family: args.family,
      fte: args.fte,
      capacity: args.capacity,
      maxTeachingHours: args.maxTeachingHours,
      totalContract: args.totalContract,
      contract: args.contract,
      team: args.team,
      specialism: args.specialism,
      role: args.role,
      isActive: true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "lecturer_profiles",
      entityId: profileId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return profileId;
  },
});

export const updateLecturer = mutation({
  args: {
    id: v.id("lecturers"),
    status: v.optional(v.string()),
    teachingAvailability: v.optional(v.number()),
    totalAllocated: v.optional(v.number()),
    allocatedTeachingHours: v.optional(v.number()),
    allocatedAdminHours: v.optional(v.number()),
    allocatedResearchHours: v.optional(v.number()),
    allocatedOtherHours: v.optional(v.number()),
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
    
    // Validate numeric inputs
    if (args.teachingAvailability !== undefined && args.teachingAvailability < 0) {
      throw new Error("Teaching availability cannot be negative");
    }
    
    if (args.totalAllocated !== undefined && args.totalAllocated < 0) {
      throw new Error("Total allocated hours cannot be negative");
    }
    
    if (args.allocatedTeachingHours !== undefined && args.allocatedTeachingHours < 0) {
      throw new Error("Allocated teaching hours cannot be negative");
    }
    
    if (args.allocatedAdminHours !== undefined && args.allocatedAdminHours < 0) {
      throw new Error("Allocated admin hours cannot be negative");
    }
    
    if (args.allocatedResearchHours !== undefined && args.allocatedResearchHours < 0) {
      throw new Error("Allocated research hours cannot be negative");
    }
    
    if (args.allocatedOtherHours !== undefined && args.allocatedOtherHours < 0) {
      throw new Error("Allocated other hours cannot be negative");
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
      entityType: "lecturers",
      entityId: id,
      changes: updateData,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

export const getById = query({
  args: { id: v.id("lecturers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const lecturer = await ctx.db.get(args.id);
    if (!lecturer) return null;
    
    // Get profile data if available
    if (lecturer.profileId) {
      const profile = await ctx.db.get(lecturer.profileId);
      return {
        ...lecturer,
        // Include profile data with fallbacks
        fullName: profile?.fullName || "Unknown",
        team: profile?.team || "Unknown",
        specialism: profile?.specialism || "Unknown",
        contract: profile?.contract || "Unknown",
        email: profile?.email || "",
        role: profile?.role || "Unknown",
        family: profile?.family || "Unknown",
        fte: profile?.fte || 1.0,
        capacity: profile?.capacity || 0,
        maxTeachingHours: profile?.maxTeachingHours || 0,
        totalContract: profile?.totalContract || 0,
      };
    } else {
      // For old structure, provide default values
      return {
        ...lecturer,
        profileId: null,
        fullName: "Unknown",
        team: "Unknown",
        specialism: "Unknown",
        contract: "Unknown",
        email: "",
        role: "Unknown",
        family: "Unknown",
        fte: 1.0,
        capacity: 0,
        maxTeachingHours: 0,
        totalContract: 0,
      };
    }
  },
});

// Delete lecturer mutation (soft delete)
export const deleteLecturer = mutation({
  args: { id: v.id("lecturers") },
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
      entityType: "lecturers",
      entityId: args.id,
      changes: { deletedAt: Date.now() },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

// Mutation to create lecturer instances for a new academic year
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
    
    // Get all lecturer profiles for this organisation
    let query = ctx.db.query("lecturer_profiles")
      .filter(q => q.eq(q.field("isActive"), true))
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    const profiles = await query.collect();
    
    const results = [];
    for (const profile of profiles) {
      try {
        // Check if lecturer already exists for this academic year
        let existingQuery = ctx.db.query("lecturers")
          .filter((q) => 
            q.and(
              q.eq(q.field("profileId"), profile._id),
              q.eq(q.field("academicYearId"), args.academicYearId),
              q.eq(q.field("organisationId"), organisation._id)
            )
          );
        
        const existing = await existingQuery.first();
        
        if (!existing) {
          // Create new lecturer instance for this academic year with default values
          const lecturerId = await ctx.db.insert("lecturers", {
            profileId: profile._id,
            academicYearId: args.academicYearId,
            status: "available",
            teachingAvailability: profile.capacity,
            totalAllocated: 0,
            allocatedTeachingHours: 0,
            allocatedAdminHours: 0,
            allocatedResearchHours: 0,
            allocatedOtherHours: 0,
            isActive: true,
            organisationId: organisation._id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          results.push({ success: true, id: lecturerId, email: profile.email });
        } else {
          results.push({ success: false, email: profile.email, error: "Already exists for this academic year" });
        }
      } catch (error) {
        results.push({ success: false, email: profile.email, error: String(error) });
      }
    }
    return results;
  },
});

// Add a specific lecturer profile to an academic year
export const addProfileToAcademicYear = mutation({
  args: {
    profileId: v.id("lecturer_profiles"),
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
    
    // Check if lecturer already exists for this academic year
    let existingQuery = ctx.db.query("lecturers")
      .filter((q) => 
        q.and(
          q.eq(q.field("profileId"), args.profileId),
          q.eq(q.field("academicYearId"), args.academicYearId),
          q.eq(q.field("organisationId"), organisation._id)
        )
      );
    
    const existing = await existingQuery.first();
    
    if (existing) {
      throw new Error("Lecturer already exists for this academic year");
    }
    
    // Get the profile to set default values
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Lecturer profile not found");
    
    // Validate that profile belongs to the same organisation
    if (profile.organisationId !== organisation._id) {
      throw new Error("Lecturer profile does not belong to this organisation");
    }
    
    // Create new lecturer instance for this academic year with default values
    const lecturerId = await ctx.db.insert("lecturers", {
      profileId: args.profileId,
      academicYearId: args.academicYearId,
      status: "available",
      teachingAvailability: profile.capacity,
      totalAllocated: 0,
      allocatedTeachingHours: 0,
      allocatedAdminHours: 0,
      allocatedResearchHours: 0,
      allocatedOtherHours: 0,
      isActive: true,
      organisationId: organisation._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "lecturers",
      entityId: lecturerId,
      changes: { profileId: args.profileId, academicYearId: args.academicYearId },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return lecturerId;
  },
});

// Mutation to bulk import lecturers
export const bulkImport = mutation({
  args: {
    lecturers: v.array(
      v.object({
        fullName: v.string(),
        email: v.string(),
        team: v.optional(v.string()),
        specialism: v.optional(v.string()),
        contract: v.string(),
        role: v.optional(v.string()),
        family: v.optional(v.string()),
        fte: v.number(),
        capacity: v.number(),
        maxTeachingHours: v.number(),
        totalContract: v.number(),
        academicYearId: v.id("academic_years"),
        status: v.optional(v.string()),
        teachingAvailability: v.optional(v.number()),
        totalAllocated: v.optional(v.number()),
        allocatedTeachingHours: v.optional(v.number()),
        allocatedAdminHours: v.optional(v.number()),
        allocatedResearchHours: v.optional(v.number()),
        allocatedOtherHours: v.optional(v.number()),
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
    for (const lecturerData of args.lecturers) {
      try {
        // Validate input data
        if (lecturerData.fte <= 0 || lecturerData.fte > 2) {
          throw new Error("FTE must be between 0 and 2");
        }
        
        if (lecturerData.capacity < 0) {
          throw new Error("Capacity cannot be negative");
        }
        
        if (lecturerData.maxTeachingHours < 0) {
          throw new Error("Maximum teaching hours cannot be negative");
        }
        
        if (lecturerData.totalContract < 0) {
          throw new Error("Total contract hours cannot be negative");
        }
        
        // Create the lecturer profile first
        const profileId = await ctx.db.insert("lecturer_profiles", {
          fullName: lecturerData.fullName,
          email: lecturerData.email,
          team: lecturerData.team || "Unknown",
          specialism: lecturerData.specialism || "Unknown",
          contract: lecturerData.contract,
          role: lecturerData.role || "Unknown",
          family: lecturerData.family || "Unknown",
          fte: lecturerData.fte,
          capacity: lecturerData.capacity,
          maxTeachingHours: lecturerData.maxTeachingHours,
          totalContract: lecturerData.totalContract,
          isActive: true,
          organisationId: organisation._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        // Create the lecturer instance for this specific academic year
        const lecturerId = await ctx.db.insert("lecturers", {
          profileId: profileId,
          academicYearId: lecturerData.academicYearId,
          status: lecturerData.status || "available",
          teachingAvailability: lecturerData.teachingAvailability ?? lecturerData.capacity,
          totalAllocated: lecturerData.totalAllocated ?? 0,
          allocatedTeachingHours: lecturerData.allocatedTeachingHours ?? 0,
          allocatedAdminHours: lecturerData.allocatedAdminHours ?? 0,
          allocatedResearchHours: lecturerData.allocatedResearchHours ?? 0,
          allocatedOtherHours: lecturerData.allocatedOtherHours ?? 0,
          notes: lecturerData.notes,
          isActive: true,
          organisationId: organisation._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        results.push({ success: true, id: lecturerId, email: lecturerData.email });
      } catch (error) {
        results.push({ success: false, email: lecturerData.email, error: String(error) });
      }
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "bulk_import",
      entityType: "lecturers",
      entityId: "bulk",
      changes: { 
        total: args.lecturers.length,
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

// Get lecturer profiles
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
    
    let query = ctx.db.query("lecturer_profiles")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Update lecturer profile
export const updateProfile = mutation({
  args: {
    id: v.id("lecturer_profiles"),
    fullName: v.optional(v.string()),
    team: v.optional(v.string()),
    specialism: v.optional(v.string()),
    contract: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    family: v.optional(v.string()),
    fte: v.optional(v.number()),
    capacity: v.optional(v.number()),
    maxTeachingHours: v.optional(v.number()),
    totalContract: v.optional(v.number()),
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
    if (args.fte !== undefined && (args.fte <= 0 || args.fte > 2)) {
      throw new Error("FTE must be between 0 and 2");
    }
    
    if (args.capacity !== undefined && args.capacity < 0) {
      throw new Error("Capacity cannot be negative");
    }
    
    if (args.maxTeachingHours !== undefined && args.maxTeachingHours < 0) {
      throw new Error("Maximum teaching hours cannot be negative");
    }
    
    if (args.totalContract !== undefined && args.totalContract < 0) {
      throw new Error("Total contract hours cannot be negative");
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
      entityType: "lecturer_profiles",
      entityId: id,
      changes: updateData,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});

// Delete lecturer profile (soft delete)
export const deleteProfile = mutation({
  args: { id: v.id("lecturer_profiles") },
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
      entityType: "lecturer_profiles",
      entityId: args.id,
      changes: { isActive: false },
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
  },
});