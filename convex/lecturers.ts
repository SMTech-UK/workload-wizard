import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Define the table schema
// This contains year-specific lecturer data that changes between academic years
export default {
  profileId: v.id("lecturer_profiles"), // Reference to the core lecturer profile
  academicYearId: v.id("academic_years"), // Reference to academic year
  
  // Year-specific data that resets each year
  status: v.string(), // "available", "unavailable", "on_leave", "sabbatical", "retired"
  teachingAvailability: v.number(),
  totalAllocated: v.number(),
  allocatedTeachingHours: v.number(),
  allocatedAdminHours: v.number(),
  allocatedResearchHours: v.number(),
  allocatedOtherHours: v.number(),
  
  // Year-specific notes and metadata
  notes: v.optional(v.string()),
  yearSpecificData: v.optional(v.any()),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
};

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
    
    let query = ctx.db.query("lecturers");
    
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
        // Handle both old and new data structures
        if (lecturer.profileId) {
          // New structure: get profile data
          const profile = await ctx.db.get(lecturer.profileId);
          return {
            ...lecturer,
            // Include profile data
            fullName: profile?.fullName || "",
            team: profile?.team || "",
            specialism: profile?.specialism || "",
            contract: profile?.contract || "",
            email: profile?.email || "",
            role: profile?.role || "",
            family: profile?.family || "",
            fte: profile?.fte || 1.0,
            capacity: profile?.capacity || 0,
            maxTeachingHours: profile?.maxTeachingHours || 0,
            totalContract: profile?.totalContract || 0,
          };
        } else {
          // Old structure: data is already in the lecturer record
          return {
            ...lecturer,
            profileId: null, // Ensure profileId is set for consistency
          };
        }
      })
    );
    
    return lecturersWithProfiles;
  },
});

// NEW: Get available lecturer profiles that aren't in a specific academic year
export const getAvailableProfiles = query({
  args: {
    academicYearId: v.id("academic_years"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get all lecturer profiles
    const allProfiles = await ctx.db.query("lecturer_profiles")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
    
    // Get profiles that are already in this academic year
    const existingLecturers = await ctx.db.query("lecturers")
      .filter((q) => q.eq(q.field("academicYearId"), args.academicYearId))
      .collect();
    
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
    
    await ctx.db.patch(args.id, { 
      status: args.status,
      updatedAt: Date.now(),
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
    
    // Get the profile to set default values
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Lecturer profile not found");
    
    return await ctx.db.insert("lecturers", {
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
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// NEW: Create a new lecturer profile and instance for a specific academic year
export const createNewLecturer = mutation({
  args: {
    // Profile data
    fullName: v.string(),
    team: v.string(),
    specialism: v.string(),
    contract: v.string(),
    email: v.string(),
    role: v.string(),
    family: v.string(),
    fte: v.number(),
    capacity: v.number(),
    maxTeachingHours: v.number(),
    totalContract: v.number(),
    // Academic year
    academicYearId: v.id("academic_years"),
    // Year-specific data
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
    
    // Create the lecturer profile first
    const profileId = await ctx.db.insert("lecturer_profiles", {
      fullName: args.fullName,
      team: args.team,
      specialism: args.specialism,
      contract: args.contract,
      email: args.email,
      role: args.role,
      family: args.family,
      fte: args.fte,
      capacity: args.capacity,
      maxTeachingHours: args.maxTeachingHours,
      totalContract: args.totalContract,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create the lecturer instance for this specific academic year
    return await ctx.db.insert("lecturers", {
      profileId: profileId,
      academicYearId: args.academicYearId,
      status: args.status || "available",
      teachingAvailability: args.teachingAvailability ?? args.capacity,
      totalAllocated: args.totalAllocated ?? 0,
      allocatedTeachingHours: args.allocatedTeachingHours ?? 0,
      allocatedAdminHours: args.allocatedAdminHours ?? 0,
      allocatedResearchHours: args.allocatedResearchHours ?? 0,
      allocatedOtherHours: args.allocatedOtherHours ?? 0,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
    
    const { id, ...updateData } = args;
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
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
        profile,
      };
    }
    
    return lecturer;
  },
});

// NEW: Delete lecturer mutation (soft delete)
export const deleteLecturer = mutation({
  args: { id: v.id("lecturers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
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
    
    // Get all lecturer profiles
    const profiles = await ctx.db.query("lecturer_profiles")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
    
    const results = [];
    for (const profile of profiles) {
      try {
        // Check if lecturer already exists for this academic year
        const existing = await ctx.db.query("lecturers")
          .filter((q) => 
            q.and(
              q.eq(q.field("profileId"), profile._id),
              q.eq(q.field("academicYearId"), args.academicYearId)
            )
          )
          .first();
        
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

// NEW: Add a specific lecturer profile to an academic year
export const addProfileToAcademicYear = mutation({
  args: {
    profileId: v.id("lecturer_profiles"),
    academicYearId: v.id("academic_years"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if lecturer already exists for this academic year
    const existing = await ctx.db.query("lecturers")
      .filter((q) => 
        q.and(
          q.eq(q.field("profileId"), args.profileId),
          q.eq(q.field("academicYearId"), args.academicYearId)
        )
      )
      .first();
    
    if (existing) {
      throw new Error("Lecturer already exists for this academic year");
    }
    
    // Get the profile to set default values
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Lecturer profile not found");
    
    // Create new lecturer instance for this academic year with default values
    return await ctx.db.insert("lecturers", {
      profileId: args.profileId,
      academicYearId: args.academicYearId,
      status: "available",
      teachingAvailability: profile.capacity,
      totalAllocated: 0,
      allocatedTeachingHours: 0,
      allocatedAdminHours: 0,
      allocatedResearchHours: 0,
      allocatedOtherHours: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});