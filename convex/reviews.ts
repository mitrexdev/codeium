import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByDedupKey = query({
  args: { dedupKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_dedup_key", (q) => q.eq("dedupKey", args.dedupKey))
      .first();
  },
});

export const listByInstallation = query({
  args: { installationId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_installation", (q) =>
        q.eq("installationId", args.installationId),
      )
      .order("desc")
      .take(50);
  },
});

export const createProcessing = mutation({
  args: {
    dedupKey: v.string(),
    installationId: v.string(),
    repo: v.string(),
    type: v.union(v.literal("push"), v.literal("pull_request")),
    githubUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviews", {
      dedupKey: args.dedupKey,
      installationId: args.installationId,
      repo: args.repo,
      type: args.type,
      status: "processing",
      ...(args.githubUrl !== undefined && { githubUrl: args.githubUrl }),
    });
  },
});

export const completeReview = mutation({
  args: {
    id: v.id("reviews"),
    summary: v.string(),
    githubUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      summary: args.summary,
      ...(args.githubUrl !== undefined && { githubUrl: args.githubUrl }),
    });
  },
});

export const failReview = mutation({
  args: { id: v.id("reviews"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "failed",
      error: args.error.slice(0, 1000),
    });
  },
});
