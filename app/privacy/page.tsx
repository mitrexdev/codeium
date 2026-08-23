import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    body: [
      "Codeium (“we”, “our”) provides AI-powered code review for GitHub repositories. This policy explains what data we collect, why, and how it is handled. The short version: we process your code diffs in memory to produce a review, and we do not store your source code.",
    ],
  },
  {
    id: "data-we-collect",
    title: "Data we collect",
    body: [
      "Account data — your name, email address, and profile image, received from Clerk when you sign in.",
      "Repository metadata — the GitHub installation ID and the names of repositories you connect.",
      "Review data — the diffs from each push or pull request, the AI-generated review, and the GitHub comment URL.",
      "Provider settings — the base URL, API key, and model you configure for reviews. API keys are stored to authenticate review requests on your behalf.",
    ],
  },
  {
    id: "code-handling",
    title: "How your code is handled",
    body: [
      "When a push or pull request triggers a review, the diff is fetched from GitHub, filtered (lockfiles, generated files, and minified bundles are skipped), truncated if oversized, and sent to the AI provider you configured. The diff is processed to produce the review and is not persisted afterwards — only the resulting review text is stored so your dashboard can display it.",
    ],
  },
  {
    id: "third-parties",
    title: "Third-party services",
    body: [
      "Clerk — authentication and account management.",
      "Convex — database storage for accounts, settings, and reviews.",
      "GitHub — repository access via a read-only GitHub App installation.",
      "Your chosen AI provider — receives the diff to generate a review, governed by that provider’s own terms.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: [
      "You can disconnect GitHub at any time from the Connectors page, which revokes our repository access. You can clear your provider settings from the Settings page. For deletion of account and review data, contact us and we will process the request.",
    ],
  },
  {
    id: "terms",
    title: "Terms of use",
    body: [
      "Codeium is provided “as is”, without warranties of any kind. Reviews are AI-generated suggestions, not guarantees of correctness or security — you remain responsible for your code and any changes you merge.",
      "You agree not to use Codeium to review repositories you do not have permission to analyze, and not to configure providers whose terms prohibit transmitting your content to them.",
      "We may update these terms as the product evolves; material changes will be reflected on this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      {/* minimal top nav */}
      <header className="border-border bg-background sticky top-0 z-50 border-b">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Wordmark />
          <Button variant="outline" size="sm" render={<Link href="/" />}>
            Back to home
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 md:py-24">
          <p className="text-primary mb-3 font-mono text-xs uppercase tracking-widest">
            Legal
          </p>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
            Privacy &amp; Policy
          </h1>
          <p className="text-muted-foreground mt-4 text-sm">
            Last updated: August 24, 2026
          </p>

          <div className="mt-14 space-y-12">
            {SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id}>
                <h2 className="font-display flex items-baseline gap-3 text-2xl tracking-tight md:text-3xl">
                  <span className="text-primary font-mono text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </h2>
                <div className="mt-4 space-y-4">
                  {s.body.map((p, j) => (
                    <p key={j} className="text-muted-foreground leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="border-border mt-16 border-t pt-8">
            <p className="text-muted-foreground text-sm">
              Questions about this policy? Reach out through your GitHub
              installation or your account email — we respond to every request.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}