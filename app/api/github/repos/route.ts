import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getInstallationOctokit } from "@/inngest/github";

export async function GET() {
  const { userId } = await auth.protect();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await fetchQuery(api.users.getMyUser, { clerkUserId: userId });
  if (!user?.githubInstallationId) {
    return NextResponse.json(
      { error: "github_not_connected" },
      { status: 400 }
    );
  }

  try {
    const octokit = await getInstallationOctokit(user.githubInstallationId);
    const repos = await octokit.paginate(
      octokit.apps.listReposAccessibleToInstallation,
      { per_page: 100 }
    );

    return NextResponse.json({
      repositories: repos.map((r) => ({
        id: r.id,
        fullName: r.full_name,
        private: r.private,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        url: r.html_url,
        defaultBranch: r.default_branch,
        updatedAt: r.updated_at ?? r.pushed_at ?? r.created_at,
      })),
    });
  } catch (err) {
    console.error("[repos] fetch failed:", err);
    return NextResponse.json(
      { error: "github_fetch_failed" },
      { status: 502 }
    );
  }
}