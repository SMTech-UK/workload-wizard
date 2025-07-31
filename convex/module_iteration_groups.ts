import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  moduleIterationId: v.id("module_iterations"),
  name: v.string(), // e.g., "Group A", "Tutorial Group 1", "Lab Section 2"
  code: v.string(), // e.g., "A", "T1", "L2"
  description: v.optional(v.string()),
  maxSize: v.optional(v.number()), // Maximum number of students in this group
  currentSize: v.optional(v.number()), // Current number of students
  isActive: v.boolean(),
  isFull: v.boolean(), // Whether this group is at capacity
  groupType: v.string(), // e.g., "Lecture", "Tutorial", "Lab", "Seminar"
  roomId: v.optional(v.id("sites")), // Physical room assignment
  virtualRoomUrl: v.optional(v.string()), // URL for virtual sessions
  notes: v.optional(v.string()),
  organisationId: v.optional(v.id("organisations")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get all module iteration groups
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_groups")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get module iteration group by ID
export const getById = query({
  args: { id: v.id("module_iteration_groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const group = await ctx.db.get(args.id);
    if (!group || group.deletedAt) return null;
    return group;
  },
});

// Get groups by module iteration
export const getByModuleIteration = query({
  args: { moduleIterationId: v.id("module_iterations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_groups")
      .filter((q) => q.eq(q.field("moduleIterationId"), args.moduleIterationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get groups by type
export const getByGroupType = query({
  args: { groupType: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_groups")
      .filter((q) => q.eq(q.field("groupType"), args.groupType))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get available groups (not full)
export const getAvailableGroups = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_groups")
      .filter((q) => q.eq(q.field("isFull"), false))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get full groups
export const getFullGroups = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_groups")
      .filter((q) => q.eq(q.field("isFull"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get groups by room
export const getByRoom = query({
  args: { roomId: v.id("sites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("module_iteration_groups")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Create a new module iteration group
export const create = mutation({
  args: {
    moduleIterationId: v.id("module_iterations"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    maxSize: v.optional(v.number()),
    currentSize: v.optional(v.number()),
    groupType: v.string(),
    roomId: v.optional(v.id("sites")),
    virtualRoomUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if code already exists for this module iteration
    const existing = await ctx.db
      .query("module_iteration_groups")
      .filter((q) => q.eq(q.field("moduleIterationId"), args.moduleIterationId))
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Group code already exists for this module iteration");
    }
    
    // Validate max size if provided
    if (args.maxSize !== undefined) {
      if (args.maxSize <= 0) {
        throw new Error("Max size must be greater than 0");
      }
    }
    
    // Validate current size if provided
    if (args.currentSize !== undefined) {
      if (args.currentSize < 0) {
        throw new Error("Current size cannot be negative");
      }
      if (args.maxSize && args.currentSize > args.maxSize) {
        throw new Error("Current size cannot exceed max size");
      }
    }
    
    const isFull = args.maxSize && args.currentSize ? args.currentSize >= args.maxSize : false;
    
    return await ctx.db.insert("module_iteration_groups", {
      ...args,
      isActive: true,
      isFull,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a module iteration group
export const update = mutation({
  args: {
    id: v.id("module_iteration_groups"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    maxSize: v.optional(v.number()),
    currentSize: v.optional(v.number()),
    groupType: v.optional(v.string()),
    roomId: v.optional(v.id("sites")),
    virtualRoomUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // If updating code, check for duplicates
    if (updates.code) {
      const current = await ctx.db.get(id);
      if (current) {
        const existing = await ctx.db
          .query("module_iteration_groups")
          .filter((q) => q.eq(q.field("moduleIterationId"), current.moduleIterationId))
          .filter((q) => q.eq(q.field("code"), updates.code))
          .filter((q) => q.neq(q.field("_id"), id))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .first();
        
        if (existing) {
          throw new Error("Group code already exists for this module iteration");
        }
      }
    }
    
    // Validate max size if provided
    if (updates.maxSize !== undefined) {
      if (updates.maxSize <= 0) {
        throw new Error("Max size must be greater than 0");
      }
    }
    
    // Validate current size if provided
    if (updates.currentSize !== undefined) {
      if (updates.currentSize < 0) {
        throw new Error("Current size cannot be negative");
      }
    }
    
    // Calculate if group is full
    let isFull = false;
    if (updates.maxSize !== undefined || updates.currentSize !== undefined) {
      const current = await ctx.db.get(id);
      if (current) {
        const maxSize = updates.maxSize ?? current.maxSize;
        const currentSize = updates.currentSize ?? current.currentSize;
        if (maxSize && currentSize) {
          isFull = currentSize >= maxSize;
        }
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      ...(isFull !== false && { isFull }),
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a module iteration group
export const remove = mutation({
  args: { id: v.id("module_iteration_groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get module iteration groups with full relationship information
export const getAllWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const groups = await ctx.db
      .query("module_iteration_groups")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
    
    // Fetch related information for each group
    const groupsWithRelations = await Promise.all(
      groups.map(async (group) => {
        const moduleIteration = await ctx.db.get(group.moduleIterationId);
        
        let room = null;
        if (group.roomId) {
          room = await ctx.db.get(group.roomId);
        }
        
        return {
          ...group,
          moduleIteration,
          room,
        };
      })
    );
    
    return groupsWithRelations;
  },
}); 