import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Interface for user patch data with optional fields
interface UserPatchData {
  subject: string;
  name: string;
  givenName: string;
  familyName: string;
  username: string;
  pictureUrl: string;
  email: string;
  tokenIdentifier: string;
}

export const store = mutation({
  args: {
    jobTitle: v.optional(v.string()),
    team: v.optional(v.string()),
    specialism: v.optional(v.string()),
    theme: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Get the current organisation
    const organisation = await ctx.db.query("organisations")
      .filter(q => q.eq(q.field("isActive"), true))
      .first();

    if (!organisation) {
      throw new Error("No active organisation found");
    }

    // Find user by subject (Clerk user id)
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("subject"), identity.subject))
      .unique();

    const userData = {
      subject: identity.subject,
      name: identity.name ?? "",
      givenName: identity.givenName ?? "",
      familyName: identity.familyName ?? "",
      username: identity.nickname ?? "",
      pictureUrl: identity.pictureUrl ?? "",
      email: identity.email ?? "",
      tokenIdentifier: identity.tokenIdentifier,
      organisationId: organisation._id,
    };

    if (user) {
      // Update core user data
      const patchData: UserPatchData = { ...userData };
      await ctx.db.patch(user._id, {
        ...patchData,
        updatedAt: Date.now(),
      });
      
      // Update or create user profile
      let userProfile = await ctx.db.query("user_profiles")
        .filter(q => q.eq(q.field("userId"), identity.subject))
        .unique();
      
      if (userProfile) {
        // Update existing profile
        await ctx.db.patch(userProfile._id, {
          firstName: identity.givenName ?? "",
          lastName: identity.familyName ?? "",
          email: identity.email ?? "",
          jobTitle: args.jobTitle,
          team: args.team,
          specialism: args.specialism,
          organisationId: organisation._id,
          updatedAt: Date.now(),
        });
      } else {
        // Create new profile
        await ctx.db.insert("user_profiles", {
          userId: identity.subject,
          firstName: identity.givenName ?? "",
          lastName: identity.familyName ?? "",
          email: identity.email ?? "",
          jobTitle: args.jobTitle,
          team: args.team,
          specialism: args.specialism,
          isActive: true,
          organisationId: organisation._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      
      // Update user settings if theme provided
      if (args.theme !== undefined) {
        let userSettings = await ctx.db.query("user_settings")
          .filter(q => q.eq(q.field("userId"), identity.subject))
          .unique();
        
        if (userSettings) {
          await ctx.db.patch(userSettings._id, {
            theme: args.theme,
            updatedAt: Date.now(),
          });
        } else {
          await ctx.db.insert("user_settings", {
            userId: identity.subject,
            theme: args.theme,
            language: "en",
            timezone: "GMT",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "24h",
            notifications: {
              email: true,
              push: true,
              inApp: true,
            },
            dashboard: {
              defaultView: "overview",
              showNotifications: true,
              showRecentActivity: true,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
      
      // Knock integration
      if (process.env.KNOCK_API_KEY) {
        const { identifyKnockUser } = await import("../src/lib/knock-server");
        await identifyKnockUser(identity.subject, patchData);
      }

      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "update",
        entityType: "users",
        entityId: user._id,
        changes: patchData,
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        organisationId: organisation._id,
        createdAt: Date.now(),
      });

      return user._id;
    } else {
      // Create new user
      const newUser = {
        ...userData,
        systemRole: "user", // Default system role
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const userId = await ctx.db.insert("users", newUser);
      
      // Create user profile
      await ctx.db.insert("user_profiles", {
        userId: identity.subject,
        firstName: identity.givenName ?? "",
        lastName: identity.familyName ?? "",
        email: identity.email ?? "",
        jobTitle: args.jobTitle,
        team: args.team,
        specialism: args.specialism,
        isActive: true,
        organisationId: organisation._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Create user settings
      await ctx.db.insert("user_settings", {
        userId: identity.subject,
        theme: args.theme ?? "system",
        language: "en",
        timezone: "GMT",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
        dashboard: {
          defaultView: "overview",
          showNotifications: true,
          showRecentActivity: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Create user preferences
      await ctx.db.insert("user_preferences", {
        userId: identity.subject,
        key: "interests",
        value: "[]",
        category: "general",
        isSystem: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Knock integration
      if (process.env.KNOCK_API_KEY) {
        const { identifyKnockUser } = await import("../src/lib/knock-server");
        await identifyKnockUser(identity.subject, newUser);
      }

      // Log audit event
      await ctx.db.insert("audit_logs", {
        userId: identity.subject,
        action: "create",
        entityType: "users",
        entityId: userId,
        changes: newUser,
        ipAddress: identity.tokenIdentifier,
        userAgent: "system",
        organisationId: organisation._id,
        createdAt: Date.now(),
      });

      return userId;
    }
  },
});

export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Get user preferences from the user_preferences table
    const preferences = await ctx.db.query("user_preferences")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .collect();
    
    // Convert to the expected format
    const preferencesMap: Record<string, any> = {};
    preferences.forEach(pref => {
      try {
        preferencesMap[pref.key] = JSON.parse(pref.value);
      } catch {
        preferencesMap[pref.key] = pref.value;
      }
    });
    
    return {
      interests: preferencesMap.interests || [],
      sessionCampus: preferencesMap.sessionCampus || "",
      sessionDay: preferencesMap.sessionDay || "",
      sessionTime: preferencesMap.sessionTime || "",
    };
  },
});

export const setPreferences = mutation({
  args: {
    preferences: v.object({
      interests: v.array(v.string()),
      sessionCampus: v.string(),
      sessionDay: v.string(),
      sessionTime: v.string(),
    })
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
    
    // Update or create preferences in the user_preferences table
    const preferencesToUpdate = [
      { key: "interests", value: JSON.stringify(args.preferences.interests) },
      { key: "sessionCampus", value: args.preferences.sessionCampus },
      { key: "sessionDay", value: args.preferences.sessionDay },
      { key: "sessionTime", value: args.preferences.sessionTime },
    ];
    
    for (const pref of preferencesToUpdate) {
      let existingPref = await ctx.db.query("user_preferences")
        .filter(q => 
          q.and(
            q.eq(q.field("userId"), identity.subject),
            q.eq(q.field("key"), pref.key)
          )
        )
        .unique();
      
      if (existingPref) {
        await ctx.db.patch(existingPref._id, {
          value: pref.value,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("user_preferences", {
          userId: identity.subject,
          key: pref.key,
          value: pref.value,
          category: "general",
          isSystem: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    
    // Knock sync for notification-relevant data changes
    if (process.env.KNOCK_API_KEY) {
      const { identifyKnockUser, triggerKnockWorkflow } = await import("../src/lib/knock-server");
      await identifyKnockUser(identity.subject, { preferences: args.preferences });
      await triggerKnockWorkflow('user-preferences-updated', [identity.subject], { preferences: args.preferences });
    }

    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "user_preferences",
      entityId: identity.subject,
      changes: args.preferences,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });

    return true;
  }
});

export const setSettings = mutation({
  args: {
    settings: v.object({
      language: v.string(),
      notifyEmail: v.boolean(),
      notifyPush: v.boolean(),
      profilePublic: v.boolean(),
      theme: v.string(),
      timezone: v.string(),
      keyboardShortcuts: v.optional(v.boolean()),
      showTooltips: v.optional(v.boolean()),
      compactMode: v.optional(v.boolean()),
      landingPage: v.optional(v.string()),
      experimental: v.optional(v.boolean()),
    })
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
    
    // Update user settings in the user_settings table
    let userSettings = await ctx.db.query("user_settings")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .unique();
    
    if (userSettings) {
      await ctx.db.patch(userSettings._id, {
        theme: args.settings.theme,
        language: args.settings.language,
        timezone: args.settings.timezone,
        notifications: {
          email: args.settings.notifyEmail,
          push: args.settings.notifyPush,
          inApp: true,
        },
        dashboard: {
          defaultView: args.settings.landingPage || "overview",
          showNotifications: true,
          showRecentActivity: true,
        },
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("user_settings", {
        userId: identity.subject,
        theme: args.settings.theme,
        language: args.settings.language,
        timezone: args.settings.timezone,
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        notifications: {
          email: args.settings.notifyEmail,
          push: args.settings.notifyPush,
          inApp: true,
        },
        dashboard: {
          defaultView: args.settings.landingPage || "overview",
          showNotifications: true,
          showRecentActivity: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Knock sync for notification-relevant data changes
    if (process.env.KNOCK_API_KEY) {
      const { identifyKnockUser, triggerKnockWorkflow } = await import("../src/lib/knock-server");
      await identifyKnockUser(identity.subject, { settings: args.settings });
      await triggerKnockWorkflow('user-settings-updated', [identity.subject], { settings: args.settings });
    }

    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "user_settings",
      entityId: identity.subject,
      changes: args.settings,
      ipAddress: identity.tokenIdentifier,
      userAgent: "system",
      organisationId: organisation._id,
      createdAt: Date.now(),
    });

    return true;
  }
});

export const getProfileFields = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Get user profile from the user_profiles table
    const userProfile = await ctx.db.query("user_profiles")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .unique();
    
    return {
      jobTitle: userProfile?.jobTitle ?? "",
      team: userProfile?.team ?? "",
      specialism: userProfile?.specialism ?? "",
      systemRole: "user", // Default system role
    };
  },
});

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Get user settings from the user_settings table
    const userSettings = await ctx.db.query("user_settings")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .unique();
    
    if (!userSettings) {
      return {
        theme: "system",
        language: "en",
        timezone: "GMT",
        notifyEmail: true,
        notifyPush: true,
        profilePublic: true,
        keyboardShortcuts: true,
        showTooltips: true,
        compactMode: false,
        landingPage: "dashboard",
        experimental: false,
      };
    }
    
    return {
      theme: userSettings.theme,
      language: userSettings.language,
      timezone: userSettings.timezone,
      notifyEmail: userSettings.notifications?.email ?? true,
      notifyPush: userSettings.notifications?.push ?? true,
      profilePublic: true, // Default value
      keyboardShortcuts: true, // Default value
      showTooltips: true, // Default value
      compactMode: false, // Default value
      landingPage: userSettings.dashboard?.defaultView ?? "dashboard",
      experimental: false, // Default value
    };
  },
});

export const getUserBySubject = query({
  args: { subject: v.string() },
  returns: v.union(
    v.object({
      systemRole: v.union(v.string(), v.null()),
      settings: v.union(v.object({}), v.null()),
      specialism: v.union(v.string(), v.null()),
      jobTitle: v.union(v.string(), v.null()),
      team: v.union(v.string(), v.null()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("subject"), args.subject))
      .unique();
    
    if (!user) return null;
    
    // Get user profile
    const userProfile = await ctx.db.query("user_profiles")
      .filter(q => q.eq(q.field("userId"), args.subject))
      .unique();
    
    return {
      systemRole: user.systemRole ?? null,
      settings: null, // Settings are now in user_settings table
      specialism: userProfile?.specialism ?? null,
      jobTitle: userProfile?.jobTitle ?? null,
      team: userProfile?.team ?? null,
    };
  }
});

// Get all users for the organisation
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
    
    let query = ctx.db.query("users")
      .filter(q => q.eq(q.field("organisationId"), organisation._id));
    
    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }
    
    const users = await query.collect();
    
    // Get profiles for all users
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await ctx.db.query("user_profiles")
          .filter(q => q.eq(q.field("userId"), user.subject))
          .unique();
        
        return {
          ...user,
          profile,
        };
      })
    );
    
    return usersWithProfiles;
  },
});

// Get user by ID
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(args.id);
    if (!user) return null;
    
    // Get user profile
    const profile = await ctx.db.query("user_profiles")
      .filter(q => q.eq(q.field("userId"), user.subject))
      .unique();
    
    return {
      ...user,
      profile,
    };
  },
});

// Update user
export const update = mutation({
  args: {
    id: v.id("users"),
    systemRole: v.optional(v.string()),
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
    
    const { id, ...updateData } = args;
    
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: identity.subject,
      action: "update",
      entityType: "users",
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

// Delete user (soft delete)
export const remove = mutation({
  args: { id: v.id("users") },
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
      entityType: "users",
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