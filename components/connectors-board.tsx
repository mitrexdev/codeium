"use client";

import { useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  MoreHorizontal,
  ExternalLink,
  Loader2,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function GitlabIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z" />
    </svg>
  );
}

function BitbucketIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
    </svg>
  );
}

type Connector = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "connected" | "available" | "soon";
  installUrl?: string | null;
  manageUrl?: string | null;
};

export function ConnectorsBoard({
  clerkUserId,
  githubConnected,
  installUrl,
  manageUrl,
}: {
  clerkUserId: string;
  githubConnected: boolean;
  installUrl: string | null;
  manageUrl: string | null;
}) {
  const disconnect = useMutation(api.users.disconnectGithub);
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDisconnect = () => {
    startTransition(async () => {
      await disconnect({ clerkUserId });
      setConfirming(false);
    });
  };

  const connectors: Connector[] = [
    {
      id: "github",
      name: "GitHub",
      description:
        githubConnected
          ? "Installed on your repos. Every push and PR is reviewed automatically."
          : "Install the Codeium GitHub App to start reviewing pushes and pull requests.",
      icon: GithubIcon,
      status: githubConnected ? "connected" : "available",
      installUrl,
      manageUrl,
    },
    {
      id: "gitlab",
      name: "GitLab",
      description:
        "Connect GitLab repos for AI reviews on merge requests. Currently in private beta.",
      icon: GitlabIcon,
      status: "soon",
    },
    {
      id: "bitbucket",
      name: "Bitbucket",
      description:
        "Review pull requests on Bitbucket Cloud and Server. Join the waitlist for early access.",
      icon: BitbucketIcon,
      status: "soon",
    },
  ];

  return (
    <div className="grid gap-4">
      {connectors.map((c) => (
        <div
          key={c.id}
          className={`relative overflow-hidden rounded-2xl border p-5 transition-colors ${
            c.status === "connected"
              ? "border-emerald-500/30 bg-card"
              : c.status === "available"
                ? "border-border/50 bg-card hover:border-primary/30"
                : "border-border/40 bg-card/40"
          }`}
        >
          <div className="flex flex-wrap items-start gap-4">
            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl border ${
                c.status === "soon"
                  ? "border-border/40 bg-muted/40 text-muted-foreground/50"
                  : "border-border/50 bg-muted/60 text-foreground"
              }`}
            >
              <c.icon className="size-6" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-semibold">{c.name}</h3>
                {c.status === "connected" && (
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-500">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    connected
                  </span>
                )}
                {c.status === "soon" && (
                  <span className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <MoreHorizontal className="size-3" />
                    coming soon
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1.5 max-w-lg text-sm leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-center">
              {c.id === "github" && c.status === "available" && c.installUrl && (
                <Button className="gap-2 font-medium shadow-lg shadow-primary/25" render={<a href={c.installUrl} />}>
                  <GithubIcon className="size-4" />
                  Connect
                </Button>
              )}

              {c.id === "github" && c.status === "connected" && (
                <>
                  {confirming ? (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDisconnect}
                        disabled={pending}
                        className="gap-2"
                      >
                        {pending && <Loader2 className="size-3.5 animate-spin" />}
                        {pending ? "Disconnecting..." : "Confirm"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirming(false)}
                        disabled={pending}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      {c.manageUrl && (
                        <Button variant="outline" size="sm" className="gap-2" render={<a href={c.manageUrl} target="_blank" rel="noreferrer" />}>
                          <ExternalLink className="size-3.5" />
                          Manage
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setConfirming(true)}
                      >
                        Disconnect
                      </Button>
                    </>
                  )}
                </>
              )}

              {c.status === "soon" && (
                <Button variant="outline" size="sm" disabled>
                  <GitBranch className="mr-2 size-3.5" />
                  Notify me
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}