import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all sites (alias for getAll)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("sites")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get all sites
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("sites")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Get site by ID
export const getById = query({
  args: { id: v.id("sites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const site = await ctx.db.get(args.id);
    if (!site || site.deletedAt) return null;
    return site;
  },
});

// Get site by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("sites")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
  },
});

// Get main site
export const getMainSite = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("sites")
      .filter((q) => q.eq(q.field("isMainSite"), true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
  },
});

// Create a new site
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    postcode: v.optional(v.string()),
    country: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    isMainSite: v.optional(v.boolean()),
    organisationId: v.optional(v.id("organisations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if code already exists
    const existing = await ctx.db
      .query("sites")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();
    
    if (existing) {
      throw new Error("Site code already exists");
    }
    
    // If this is being set as main site, unset other main sites
    if (args.isMainSite) {
      const mainSites = await ctx.db
        .query("sites")
        .filter((q) => q.eq(q.field("isMainSite"), true))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .collect();
      
      for (const site of mainSites) {
        await ctx.db.patch(site._id, { isMainSite: false });
      }
    }
    
    return await ctx.db.insert("sites", {
      ...args,
      isActive: true,
      isMainSite: args.isMainSite ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a site
export const update = mutation({
  args: {
    id: v.id("sites"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    postcode: v.optional(v.string()),
    country: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isMainSite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const { id, ...updates } = args;
    
    // If updating code, check for duplicates
    if (updates.code) {
      const existing = await ctx.db
        .query("sites")
        .filter((q) => q.eq(q.field("code"), updates.code))
        .filter((q) => q.neq(q.field("_id"), id))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .first();
      
      if (existing) {
        throw new Error("Site code already exists");
      }
    }
    
    // If this is being set as main site, unset other main sites
    if (updates.isMainSite) {
      const mainSites = await ctx.db
        .query("sites")
        .filter((q) => q.eq(q.field("isMainSite"), true))
        .filter((q) => q.neq(q.field("_id"), id))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .collect();
      
      for (const site of mainSites) {
        await ctx.db.patch(site._id, { isMainSite: false });
      }
    }
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Soft delete a site
export const remove = mutation({
  args: { id: v.id("sites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const site = await ctx.db.get(args.id);
    if (site?.isMainSite) {
      throw new Error("Cannot delete the main site");
    }
    
    return await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get sites by city
export const getByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("sites")
      .filter((q) => q.eq(q.field("city"), args.city))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

// Search sites by name or code
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const sites = await ctx.db
      .query("sites")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
    
    // Filter by name or code (case-insensitive)
    const query = args.query.toLowerCase();
    return sites.filter(
      (site) =>
        site.name.toLowerCase().includes(query) ||
        site.code.toLowerCase().includes(query)
    );
  },
}); 