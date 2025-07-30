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
  updatedAt: string;
  tokenIdentifier: string;
  jobTitle?: string;
  team?: string;
  specialism?: string;
  settings?: {
    theme: string;
    language: string;
    timezone: string;
    notifyEmail: boolean;
    notifyPush: boolean;
    profilePublic: boolean;
  };
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

    // Find user by subject (Clerk user id)
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("subject"), identity.subject))
      .unique();

    const userData = {
      subject: identity.subject,
      name: identity.name ?? "",
      givenName: identity.givenName ?? "",
      familyName: identity.familyName ?? "",
      username: identity.nickname ?? "", // or identity.username if available
      pictureUrl: identity.pictureUrl ?? "",
      email: identity.email ?? "",
      updatedAt: identity.updatedAt ?? "",
      tokenIdentifier: identity.tokenIdentifier,
    };

    if (user) {
      // Only update jobTitle, team, specialism, and theme if provided
      const patchData: UserPatchData = { ...userData };
      if (args.jobTitle !== undefined) patchData.jobTitle = args.jobTitle;
      if (args.team !== undefined) patchData.team = args.team;
      if (args.specialism !== undefined) patchData.specialism = args.specialism;
      if (args.theme !== undefined) {
        patchData.settings = { ...(user.settings || {}), theme: args.theme };
      }
      await ctx.db.patch(user._id, patchData);
      // Knock integration
      if (process.env.KNOCK_API_KEY) {
        const { identifyKnockUser } = await import("../src/lib/knock-server");
        await identifyKnockUser(identity.subject, patchData);
      }
      return user._id;
    } else {
      const newUser = {
        ...userData,
        jobTitle: args.jobTitle ?? "",
        team: args.team ?? "",
        specialism: args.specialism ?? "",
        systemRole: "user", // Default system role
        // Default settings for new users
        settings: {
          theme: args.theme ?? "system",
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
        },
        preferences: {
          interests: [],
          sessionCampus: "",
          sessionDay: "",
          sessionTime: "",
        },
      };
      const id = await ctx.db.insert("users", newUser);
      // Knock integration
      if (process.env.KNOCK_API_KEY) {
        const { identifyKnockUser } = await import("../src/lib/knock-server");
        await identifyKnockUser(identity.subject, newUser);
      }
      return id;
    }
  },
});

export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return null instead of throwing error for better UX
      return null;
    }
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("subject"), identity.subject))
      .unique();
    if (!user) return {
      interests: [],
      sessionCampus: "",
      sessionDay: "",
      sessionTime: "",
    };
    return user.preferences ?? {
      interests: [],
      sessionCampus: "",
      sessionDay: "",
      sessionTime: "",
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
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("subject"), identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { preferences: args.preferences });
    // Knock sync for notification-relevant data changes
    if (process.env.KNOCK_API_KEY) {
      const { identifyKnockUser, triggerKnockWorkflow } = await import("../src/lib/knock-server");
      await identifyKnockUser(identity.subject, { ...user, preferences: args.preferences });
      await triggerKnockWorkflow('user-preferences-updated', [identity.subject], { preferences: args.preferences });
    }
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
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("subject"), identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { settings: args.settings });
    // Knock sync for notification-relevant data changes
    if (process.env.KNOCK_API_KEY) {
      const { identifyKnockUser, triggerKnockWorkflow } = await import("../src/lib/knock-server");
      await identifyKnockUser(identity.subject, { ...user, settings: args.settings });
      await triggerKnockWorkflow('user-settings-updated', [identity.subject], { settings: args.settings });
    }
    return true;
  }
});

export const getProfileFields = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return null instead of throwing error for better UX
      return null;
    }
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("subject"), identity.subject))
      .unique();
    return {
      jobTitle: user?.jobTitle ?? "",
      team: user?.team ?? "",
      specialism: user?.specialism ?? "",
      systemRole: user?.systemRole ?? "",
    };
  },
});

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return null instead of throwing error for better UX
      return null;
    }
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("subject"), identity.subject))
      .unique();
    return user?.settings ?? {
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
  },
});

export const getUserBySubject = query({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("subject"), args.subject))
      .unique();
    if (!user) return null;
    return {
      systemRole: user.systemRole ?? null,
      settings: user.settings ?? null,
      specialism: user.specialism ?? null,
      jobTitle: user.jobTitle ?? null,
      team: user.team ?? null,
    };
  }
});