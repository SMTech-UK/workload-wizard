import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all teams
export const getAll = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
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
    
    let query = ctx.db.query("teams")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.departmentId) {
      query = query.filter(q => q.eq(q.field("departmentId"), args.departmentId));
    }
    
    if (args.facultyId) {
      query = query.filter(q => q.eq(q.field("facultyId"), args.facultyId));
    }
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

// Get team by ID
export const getById = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const team = await ctx.db.get(args.id);
    if (!team) return null;
    
    // Get related department and faculty
    const [department, faculty] = await Promise.all([
      team.departmentId ? ctx.db.get(team.departmentId) : null,
      team.facultyId ? ctx.db.get(team.facultyId) : null,
    ]);
    
    return {
      ...team,
      department,
      faculty,
    };
  },
});

// Create a new team
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
    teamLeaderId: v.optional(v.id("user_profiles")),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    location: v.optional(v.string()),
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
    
    // Check if team code already exists
    const existingTeam = await ctx.db.query("teams")
      .filter(q => 
        q.and(
          q.eq(q.field("code"), args.code),
          q.eq(q.field("organisationId"), organisation._id)
        )
      )
      .first();
    
    if (existingTeam) {
      throw new Error("Team code already exists");
    }
    
    // Validate that department and faculty belong to the same organisation
    if (args.departmentId) {
      const department = await ctx.db.get(args.departmentId);
      if (!department || department.organisationId !== organisation._id) {
        throw new Error("Department does not belong to this organisation");
      }
    }
    
    if (args.facultyId) {
      const faculty = await ctx.db.get(args.facultyId);
      if (!faculty || faculty.organisationId !== organisation._id) {
        throw new Error("Faculty does not belong to this organisation");
      }
    }
    
         const teamId = await ctx.db.insert("teams", {
       ...args,
       teamType: "department", // Default team type
       level: "department", // Default level
       isActive: args.isActive ?? true,
       organisationId: organisation._id,
       createdAt: Date.now(),
       updatedAt: Date.now(),
     });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "create",
      entityType: "teams",
      entityId: teamId,
      changes: args,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });
    
    return teamId;
  },
});

// Update a team
export const update = mutation({
  args: {
    id: v.id("teams"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    facultyId: v.optional(v.id("faculties")),
    teamLeaderId: v.optional(v.id("user_profiles")),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    location: v.optional(v.string()),
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
    
    const { id, ...updates } = args;
    
    // Check if team code already exists (if being updated)
    if (updates.code) {
      const existingTeam = await ctx.db.query("teams")
        .filter(q => 
          q.and(
            q.eq(q.field("code"), updates.code),
            q.eq(q.field("organisationId"), organisation._id),
            q.neq(q.field("_id"), id)
          )
        )
        .first();
      
      if (existingTeam) {
        throw new Error("Team code already exists");
      }
    }
    
    // Validate that department and faculty belong to the same organisation
    if (updates.departmentId) {
      const department = await ctx.db.get(updates.departmentId);
      if (!department || department.organisationId !== organisation._id) {
        throw new Error("Department does not belong to this organisation");
      }
    }
    
    if (updates.facultyId) {
      const faculty = await ctx.db.get(updates.facultyId);
      if (!faculty || faculty.organisationId !== organisation._id) {
        throw new Error("Faculty does not belong to this organisation");
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
      entityType: "teams",
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

// Delete a team (soft delete)
export const remove = mutation({
  args: { id: v.id("teams") },
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
      entityType: "teams",
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

// Get teams with department and faculty information
export const getAllWithRelations = query({
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
    
    const teams = await ctx.db.query("teams")
      .filter(q => q.eq(q.field("organisationId"), organisation._id))
      .collect();
    
    // Fetch related information for each team
    const teamsWithRelations = await Promise.all(
      teams.map(async (team) => {
        const [department, faculty, teamLeader] = await Promise.all([
          team.departmentId ? ctx.db.get(team.departmentId) : null,
          team.facultyId ? ctx.db.get(team.facultyId) : null,
          team.teamLeaderId ? ctx.db.get(team.teamLeaderId) : null,
        ]);
        
        return {
          ...team,
          department,
          faculty,
          teamLeader,
        };
      })
    );
    
    return teamsWithRelations;
  },
});

// Bulk import teams
export const bulkImport = mutation({
  args: {
    teams: v.array(
      v.object({
        name: v.string(),
        code: v.string(),
        description: v.optional(v.string()),
        departmentId: v.optional(v.id("departments")),
        facultyId: v.optional(v.id("faculties")),
        teamLeaderId: v.optional(v.id("user_profiles")),
        contactEmail: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        location: v.optional(v.string()),
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
    for (const teamData of args.teams) {
      try {
        // Check if team code already exists
        const existingTeam = await ctx.db.query("teams")
          .filter(q => 
            q.and(
              q.eq(q.field("code"), teamData.code),
              q.eq(q.field("organisationId"), organisation._id)
            )
          )
          .first();
        
        if (existingTeam) {
          throw new Error(`Team code ${teamData.code} already exists`);
        }
        
        // Validate that department and faculty belong to the same organisation
        if (teamData.departmentId) {
          const department = await ctx.db.get(teamData.departmentId);
          if (!department || department.organisationId !== organisation._id) {
            throw new Error(`Department does not belong to this organisation for team ${teamData.code}`);
          }
        }
        
        if (teamData.facultyId) {
          const faculty = await ctx.db.get(teamData.facultyId);
          if (!faculty || faculty.organisationId !== organisation._id) {
            throw new Error(`Faculty does not belong to this organisation for team ${teamData.code}`);
          }
        }
        
                 const teamId = await ctx.db.insert("teams", {
           ...teamData,
           teamType: "department", // Default team type
           level: "department", // Default level
           isActive: teamData.isActive ?? true,
           organisationId: organisation._id,
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });
        
        results.push({ success: true, id: teamId, code: teamData.code });
      } catch (error) {
        results.push({ success: false, code: teamData.code, error: String(error) });
      }
    }
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "bulk_import",
      entityType: "teams",
      entityId: "bulk",
      changes: { 
        total: args.teams.length,
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