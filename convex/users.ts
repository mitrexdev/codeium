import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const PROFILE_FIELDS = {
  email: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
};

export const getMyUser = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
  },
});

export const getByInstallation = query({
  args: { installationId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_installation", (q) =>
        q.eq("githubInstallationId", args.installationId),
      )
      .first();
  },
});

export const upsertUser = mutation({
  args: {
    clerkUserId: v.string(),
    githubInstallationId: v.optional(v.string()),
    ...PROFILE_FIELDS,
  },
  handler: async (ctx, args) => {
    const { githubInstallationId, ...profile } = args;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (existing) {
      const patch: Record<string, string> = {};
      if (githubInstallationId !== undefined) {
        patch.githubInstallationId = githubInstallationId;
      }
      for (const [key, value] of Object.entries(profile)) {
        // only overwrite when a non-empty value arrives
        if (value !== undefined && value !== "") {
          patch[key] = value;
        }
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existing._id, patch);
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      ...(githubInstallationId !== undefined && {
        githubInstallationId,
      }),
      ...Object.fromEntries(
        Object.entries(profile).filter(([, v]) => v !== undefined && v !== ""),
      ),
    });
  },
});

export const updateProfile = mutation({
  args: {
    clerkUserId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
    if (!existing) throw new Error("user not found");

    await ctx.db.patch(existing._id, {
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
    });
    return existing._id;
  },
});

export const saveAiSettings = mutation({
  args: {
    clerkUserId: v.string(),
    aiBaseUrl: v.string(),
    aiApiKey: v.optional(v.string()), // undefined = keep existing key
    aiModel: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
    if (!existing) throw new Error("user not found");

    const patch: Record<string, string | undefined> = {
      aiBaseUrl: args.aiBaseUrl.trim().replace(/\/+$/, ""),
      aiModel: args.aiModel,
    };
    if (args.aiApiKey !== undefined && args.aiApiKey !== "") {
      patch.aiApiKey = args.aiApiKey.trim();
    }

    await ctx.db.patch(existing._id, patch);
    return existing._id;
  },
});

export const disconnectGithub = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (!existing) return null;

    await ctx.db.patch(existing._id, { githubInstallationId: undefined });
    return existing._id;
  },
});