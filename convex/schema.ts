import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    githubInstallationId: v.optional(v.string()),

    // profile (synced from Clerk on login)
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // AI provider settings (per-user, replaces env config)
    aiBaseUrl: v.optional(v.string()),
    aiApiKey: v.optional(v.string()),
    aiModel: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_installation", ["githubInstallationId"]),

  reviews: defineTable({
    dedupKey: v.string(), // github delivery ID or commit/PR SHA
    installationId: v.string(),
    repo: v.string(),
    type: v.union(v.literal("push"), v.literal("pull_request")),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    summary: v.optional(v.string()),
    error: v.optional(v.string()),
    githubUrl: v.optional(v.string()), // link to the PR/commit for the dashboard
  })
    .index("by_dedup_key", ["dedupKey"])
    .index("by_installation", ["installationId"]),
});