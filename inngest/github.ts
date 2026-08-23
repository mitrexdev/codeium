import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

function getPrivateKey(): string {
  const raw = process.env.GITHUB_APP_PRIVATE_KEY!;
  if (raw.includes("-----BEGIN")) {
    return raw.replace(/\\n/g, "\n");
  }
  return Buffer.from(raw, "base64").toString("utf8");
}

export async function getInstallationOctokit(
  installationId: string,
): Promise<Octokit> {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: getPrivateKey(),
  });

  const { token } = await auth({
    type: "installation",
    installationId,
  });

  return new Octokit({ auth: token });
}

const IGNORED_PATTERNS = [
  /(^|\/)dist\//,
  /(^|\/)node_modules\//,
  /\.lock$/,
  /\.min\.js$/,
];

const MAX_DIFF_CHARS = 50_000;

export type DiffFile = {
  filename: string;
  patch?: string | undefined;
};

export function filterAndTruncateDiff(files: DiffFile[]): {
  diffText: string;
  skippedFiles: number;
  truncated: boolean;
} {
  const kept = files.filter(
    (f) => !IGNORED_PATTERNS.some((p) => p.test(f.filename)),
  );
  const skippedFiles = files.length - kept.length;

  let diffText = "";
  for (const file of kept) {
    const section = [
      `--- a/${file.filename}`,
      `+++ b/${file.filename}`,
      file.patch ?? "(no textual patch)",
      "",
    ].join("\n");

    if (diffText.length + section.length > MAX_DIFF_CHARS) {
      return { diffText, skippedFiles, truncated: true };
    }
    diffText += section;
  }

  return { diffText, skippedFiles, truncated: false };
}

export function splitRepo(fullName: string): { owner: string; repo: string } {
  const [owner, repo] = fullName.split("/");
  if (!owner || !repo) {
    throw new Error(`invalid repo full name: ${fullName}`);
  }
  return { owner, repo };
}
