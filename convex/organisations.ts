import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export default defineTable({
  // Core organization info
  name: v.string(),
  code: v.optional(v.string()),
  domain: v.optional(v.string()),
  
  // Contact information
  contactEmail: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  website: v.optional(v.string()),
  
  // Address
  address: v.optional(v.object({
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
  })),
  
  // Academic settings
  standardClassSize: v.optional(v.number()),
  defaultTeachingHours: v.optional(v.number()),
  defaultMarkingHours: v.optional(v.number()),
  defaultAdminHours: v.optional(v.number()),
  
  // Academic year settings
  currentAcademicYearId: v.optional(v.id("academic_years")),
  currentSemesterPeriodId: v.optional(v.id("semester_periods")),
  
  // Organization settings
  timezone: v.optional(v.string()),
  locale: v.optional(v.string()),
  currency: v.optional(v.string()),
  
  // Feature flags
  enableModuleAllocations: v.optional(v.boolean()),
  enableWorkloadTracking: v.optional(v.boolean()),
  enableNotifications: v.optional(v.boolean()),
  requireAdminApproval: v.optional(v.boolean()),
  enableAuditTrail: v.optional(v.boolean()),
  enableAdvancedReporting: v.optional(v.boolean()),
  
  // Status
  isActive: v.boolean(),
  status: v.string(), // "active", "inactive", "suspended", "pending"
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

// Get the current organisation settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const organisation = await ctx.db.query("organisations").first();
    return organisation;
  },
});

// Update organisation settings
export const update = mutation({
  args: {
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    domain: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      postalCode: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
    standardClassSize: v.optional(v.number()),
    defaultTeachingHours: v.optional(v.number()),
    defaultMarkingHours: v.optional(v.number()),
    defaultAdminHours: v.optional(v.number()),
    currentAcademicYearId: v.optional(v.id("academic_years")),
    currentSemesterPeriodId: v.optional(v.id("semester_periods")),
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
    currency: v.optional(v.string()),
    enableModuleAllocations: v.optional(v.boolean()),
    enableWorkloadTracking: v.optional(v.boolean()),
    enableNotifications: v.optional(v.boolean()),
    requireAdminApproval: v.optional(v.boolean()),
    enableAuditTrail: v.optional(v.boolean()),
    enableAdvancedReporting: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const organisation = await ctx.db.query("organisations").first();
    
    if (organisation) {
      // Update existing organisation
      return await ctx.db.patch(organisation._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      // Create new organisation if none exists
      return await ctx.db.insert("organisations", {
        name: args.name || "Default Organisation",
        isActive: true,
        status: "active",
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Update standard class size specifically
export const updateStandardClassSize = mutation({
  args: {
    standardClassSize: v.number(),
  },
  handler: async (ctx, args) => {
    const organisation = await ctx.db.query("organisations").first();
    
    if (organisation) {
      return await ctx.db.patch(organisation._id, {
        standardClassSize: args.standardClassSize,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("organisations", {
        name: "Default Organisation",
        standardClassSize: args.standardClassSize,
        isActive: true,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Update default teaching hours specifically
export const updateDefaultTeachingHours = mutation({
  args: {
    defaultTeachingHours: v.number(),
  },
  handler: async (ctx, args) => {
    const organisation = await ctx.db.query("organisations").first();
    
    if (organisation) {
      return await ctx.db.patch(organisation._id, {
        defaultTeachingHours: args.defaultTeachingHours,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("organisations", {
        name: "Default Organisation",
        defaultTeachingHours: args.defaultTeachingHours,
        isActive: true,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
}); 