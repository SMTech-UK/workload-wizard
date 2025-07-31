import { defineTable } from "convex/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export default defineTable({
  // Core team info
  name: v.string(),
  code: v.string(),
  description: v.optional(v.string()),
  
  // Team classification
  teamType: v.string(), // "department", "faculty", "school", "institute", "center", "unit"
  level: v.string(), // "faculty", "department", "module", "course"
  
  // Relationships
  departmentId: v.optional(v.id("departments")),
  facultyId: v.optional(v.id("faculties")),
  parentTeamId: v.optional(v.id("teams")), // For hierarchical team structure
  
  // Team leadership
  teamLeaderId: v.optional(v.id("user_profiles")),
  deputyLeaderId: v.optional(v.id("user_profiles")),
  
  // Academic context
  academicYearId: v.optional(v.id("academic_years")), // For year-specific teams
  
  // Team composition
  memberCount: v.optional(v.number()),
  maxMembers: v.optional(v.number()),
  isFull: v.optional(v.boolean()),
  
  // Team settings
  isActive: v.boolean(),
  isSystem: v.boolean(), // System-defined teams
  isPublic: v.boolean(), // Visible to all users
  
  // Workload settings
  defaultWorkloadHours: v.optional(v.number()),
  workloadDistribution: v.optional(v.object({
    teaching: v.optional(v.number()),
    research: v.optional(v.number()),
    admin: v.optional(v.number()),
    other: v.optional(v.number()),
  })),
  
  // Metadata
  tags: v.optional(v.array(v.string())),
  notes: v.optional(v.string()),
  organisationId: v.id("organisations"),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all teams
export const getAll = query({
  args: {
    academicYearId: v.optional(v.id("academic_years")),
    teamType: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    let query = ctx.db.query("teams");
    
    if (args.academicYearId) {
      query = query.filter(q => q.eq(q.field("academicYearId"), args.academicYearId));
    }
    
    if (args.teamType) {
      query = query.filter(q => q.eq(q.field("teamType"), args.teamType));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Get team by ID with related data
export const getById = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const team = await ctx.db.get(args.id);
    if (!team) return null;
    
    // Get related data
    const [department, faculty, teamLeader, deputyLeader, parentTeam] = await Promise.all([
      team.departmentId ? ctx.db.get(team.departmentId) : null,
      team.facultyId ? ctx.db.get(team.facultyId) : null,
      team.teamLeaderId ? ctx.db.get(team.teamLeaderId) : null,
      team.deputyLeaderId ? ctx.db.get(team.deputyLeaderId) : null,
      team.parentTeamId ? ctx.db.get(team.parentTeamId) : null,
    ]);
    
    return {
      ...team,
      department,
      faculty,
      teamLeader,
      deputyLeader,
      parentTeam,
    };
  },
});

// Get teams by department
export const getByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("teams")
      .filter(q => q.eq(q.field("departmentId"), args.departmentId))
      .collect();
  },
});

// Get teams by faculty
export const getByFaculty = query({
  args: { facultyId: v.id("faculties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.query("teams")
      .filter(q => q.eq(q.field("facultyId"), args.facultyId))
      .collect();
  },
});

// Create new team
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    teamType: v.string(),
    level: v.string(),
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
    parentTeamId: v.optional(v.id("teams")),
    teamLeaderId: v.optional(v.id("user_profiles")),
    deputyLeaderId: v.optional(v.id("user_profiles")),
    academicYearId: v.optional(v.id("academic_years")),
    memberCount: v.optional(v.number()),
    maxMembers: v.optional(v.number()),
    defaultWorkloadHours: v.optional(v.number()),
    workloadDistribution: v.optional(v.object({
      teaching: v.optional(v.number()),
      research: v.optional(v.number()),
      admin: v.optional(v.number()),
      other: v.optional(v.number()),
    })),
    isActive: v.optional(v.boolean()),
    isSystem: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Validate code uniqueness
    const existingTeam = await ctx.db.query("teams")
      .filter(q => q.eq(q.field("code"), args.code))
      .first();
    
    if (existingTeam) {
      throw new Error("Team code must be unique");
    }
    
    return await ctx.db.insert("teams", {
      ...args,
      isActive: args.isActive ?? true,
      isSystem: args.isSystem ?? false,
      isPublic: args.isPublic ?? true,
      isFull: args.maxMembers ? (args.memberCount || 0) >= args.maxMembers : false,
      organisationId: "default", // TODO: Get from context
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update team
export const update = mutation({
  args: {
    id: v.id("teams"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    teamType: v.optional(v.string()),
    level: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
    parentTeamId: v.optional(v.id("teams")),
    teamLeaderId: v.optional(v.id("user_profiles")),
    deputyLeaderId: v.optional(v.id("user_profiles")),
    academicYearId: v.optional(v.id("academic_years")),
    memberCount: v.optional(v.number()),
    maxMembers: v.optional(v.number()),
    defaultWorkloadHours: v.optional(v.number()),
    workloadDistribution: v.optional(v.object({
      teaching: v.optional(v.number()),
      research: v.optional(v.number()),
      admin: v.optional(v.number()),
      other: v.optional(v.number()),
    })),
    isActive: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updateData } = args;
    
    // Validate code uniqueness if code is being updated
    if (updateData.code) {
      const existingTeam = await ctx.db.query("teams")
        .filter(q => 
          q.and(
            q.eq(q.field("code"), updateData.code),
            q.neq(q.field("_id"), id)
          )
        )
        .first();
      
      if (existingTeam) {
        throw new Error("Team code must be unique");
      }
    }
    
    // Update isFull status if memberCount or maxMembers changed
    if (updateData.memberCount !== undefined || updateData.maxMembers !== undefined) {
      const currentTeam = await ctx.db.get(id);
      if (currentTeam) {
        const newMemberCount = updateData.memberCount ?? currentTeam.memberCount ?? 0;
        const newMaxMembers = updateData.maxMembers ?? currentTeam.maxMembers;
        updateData.isFull = newMaxMembers ? newMemberCount >= newMaxMembers : false;
      }
    }
    
    return await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

// Delete team
export const remove = mutation({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const team = await ctx.db.get(args.id);
    if (!team) throw new Error("Team not found");
    
    if (team.isSystem) {
      throw new Error("Cannot delete system teams");
    }
    
    // Soft delete
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
}); 