import { inngest } from "./client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import {
  filterAndTruncateDiff,
  getInstallationOctokit,
  splitRepo,
} from "./github";
import { analyzeDiff } from "./openrouter";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type EventData = {
  eventName: string;
  deliveryId: string;
  payload: Record<string, unknown>;
};

type ParsedEvent = {
  type: "push" | "pull_request";
  repo: string;
  installationId: string;
  sha: string;
  dedupKey: string;
  githubUrl?: string;
  pullNumber?: number;
  beforeSha?: string;
};

function parseEvent(data: EventData): ParsedEvent | { skipped: string } {
  const { eventName, deliveryId, payload } = data;

  const repo = (payload.repository as { full_name?: string } | undefined)
    ?.full_name;
  const installationId = (
    payload.installation as { id?: number } | undefined
  )?.id;

  if (!repo || !installationId) {
    return { skipped: `unhandled event: ${eventName}` };
  }

  if (eventName !== "push" && eventName !== "pull_request") {
    return { skipped: `unsupported event: ${eventName}` };
  }

  if (eventName === "pull_request") {
    const pr = payload.pull_request as
      | { head?: { sha?: string }; html_url?: string }
      | undefined;
    const number = payload.number as number | undefined;
    if (!pr?.head?.sha || !number) {
      return { skipped: "pull_request without head sha" };
    }
    const sha = pr.head.sha;
    return {
      type: "pull_request",
      repo,
      installationId: String(installationId),
      sha,
      dedupKey: deliveryId || `${repo}:${sha}`,
      ...(pr.html_url && { githubUrl: pr.html_url }),
      pullNumber: number,
    };
  }

  const after = payload.after as string | undefined;
  const beforeSha = payload.before as string | undefined;
  if (!after) {
    return { skipped: "push without after sha" };
  }
  return {
    type: "push",
    repo,
    installationId: String(installationId),
    sha: after,
    dedupKey: deliveryId || `${repo}:${after}`,
    githubUrl: `https://github.com/${repo}/commit/${after}`,
    beforeSha,
  };
}

export const analyzeGithubEvent = inngest.createFunction(
  {
    id: "analyze-github-event",
    triggers: [{ event: "github/event.received" }],
    onFailure: async ({ event, error }) => {
      const failure = event.data as unknown as {
        event: { data: EventData };
      };
      const parsed = parseEvent(failure.event.data);
      if (!("dedupKey" in parsed)) return;

      const review = await convex.query(api.reviews.getByDedupKey, {
        dedupKey: parsed.dedupKey,
      });
      if (review) {
        await convex.mutation(api.reviews.failReview, {
          id: review._id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
  async ({ event, step }) => {
    const parsed = parseEvent(event.data as EventData);
    if ("skipped" in parsed) {
      return { skipped: true, reason: parsed.skipped };
    }

    // Phase 9: dedup — redelivered webhooks reuse the same delivery ID.
    const alreadyProcessed = await step.run("check-dedup", async () => {
      const existing = await convex.query(api.reviews.getByDedupKey, {
        dedupKey: parsed.dedupKey,
      });
      if (existing) {
        console.log(`already processed, skipping (${parsed.dedupKey})`);
        return true;
      }
      return false;
    });
    if (alreadyProcessed) {
      return { skipped: true, reason: "already processed" };
    }

    const reviewId = (await step.run("create-review-record", async () => {
      return await convex.mutation(api.reviews.createProcessing, {
        dedupKey: parsed.dedupKey,
        installationId: parsed.installationId,
        repo: parsed.repo,
        type: parsed.type,
        ...(parsed.githubUrl && { githubUrl: parsed.githubUrl }),
      });
    })) as Id<"reviews">;

    const diffResult = await step.run("fetch-diff", async () => {
      const octokit = await getInstallationOctokit(parsed.installationId);
      const { owner, repo: repoName } = splitRepo(parsed.repo);

      let files: { filename: string; patch?: string }[];

      if (parsed.type === "pull_request") {
        files = await octokit.paginate(octokit.pulls.listFiles, {
          owner,
          repo: repoName,
          pull_number: parsed.pullNumber!,
          per_page: 100,
        });
      } else if (parsed.beforeSha && /^0+$/.test(parsed.beforeSha)) {
        // new branch push: compare has no base, review the head commit itself
        const commit = await octokit.repos.getCommit({
          owner,
          repo: repoName,
          ref: parsed.sha,
        });
        files = commit.data.files ?? [];
      } else {
        const compare = await octokit.repos.compareCommits({
          owner,
          repo: repoName,
          base: parsed.beforeSha ?? parsed.sha,
          head: parsed.sha,
        });
        files = compare.data.files ?? [];
      }

      const result = filterAndTruncateDiff(files);
      console.log(
        `[fetch-diff] ${files.length} file(s), ${result.skippedFiles} filtered, truncated=${result.truncated}`,
      );
      console.log(`[fetch-diff] preview:\n${result.diffText.slice(0, 500)}`);

      if (!result.diffText) {
        throw new Error("no reviewable diff content found");
      }
      return {
        diffText: result.diffText,
        truncated: result.truncated,
        fileCount: files.length,
      };
    });

    // Phase 7: AI analysis using the repo owner's provider settings.
    const analysis = await step.run("analyze-diff", async () => {
      const owner = await convex.query(api.users.getByInstallation, {
        installationId: parsed.installationId,
      });
      if (!owner?.aiBaseUrl || !owner?.aiApiKey || !owner?.aiModel) {
        throw new Error(
          "AI provider not configured. Open Settings → Providers and save a base URL, API key, and model.",
        );
      }
      const result = await analyzeDiff(
        diffResult.diffText,
        {
          baseUrl: owner.aiBaseUrl,
          apiKey: owner.aiApiKey,
          model: owner.aiModel,
        },
        {
          repo: parsed.repo,
          type: parsed.type,
          truncated: diffResult.truncated,
          trivial: diffResult.fileCount <= 2,
        },
      );
      console.log(`[analyze-diff] model=${owner.aiModel}`);
      console.log(`[analyze-diff] response:\n${result.slice(0, 500)}`);
      return result;
    });

    // Phase 8: post the review back to GitHub.
    const commentBody = [
      "## Codeium AI Review",
      "",
      analysis,
      "",
      "---",
      "<sub>Posted by [Codeium](/) · AI code review</sub>",
    ].join("\n");

    const commentUrl = await step.run("post-comment", async () => {
      const octokit = await getInstallationOctokit(parsed.installationId);
      const { owner, repo: repoName } = splitRepo(parsed.repo);

      if (parsed.type === "pull_request") {
        const { data } = await octokit.issues.createComment({
          owner,
          repo: repoName,
          issue_number: parsed.pullNumber!,
          body: commentBody,
        });
        return data.html_url;
      }

      const { data } = await octokit.repos.createCommitComment({
        owner,
        repo: repoName,
        commit_sha: parsed.sha,
        body: commentBody,
      });
      return data.html_url;
    });

    await step.run("complete-review", async () => {
      await convex.mutation(api.reviews.completeReview, {
        id: reviewId as Id<"reviews">,
        summary: analysis,
        ...(commentUrl && { githubUrl: commentUrl }),
      });
    });

    return { reviewId, status: "completed" as const };
  },
);

export const functions = [analyzeGithubEvent];
