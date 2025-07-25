import { mutation } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
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
      await ctx.db.patch(user._id, userData);
      return user._id;
    } else {
      return await ctx.db.insert("users", userData);
    }
  },
});