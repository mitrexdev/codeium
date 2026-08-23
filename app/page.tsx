import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark, SpikeMark } from "@/components/wordmark";
import { CodePreview } from "@/components/landing/code-preview";
import { Faq } from "@/components/landing/faq";
import { Testimonials } from "@/components/landing/testimonials";
import { Reveal, TiltCard, TypedTerminal } from "@/components/landing/motion";
import {
  ArrowRight,
  GitPullRequestArrow,
  ShieldCheck,
  Zap,
  MessagesSquare,
} from "lucide-react";

const logos = ["vercel", "stripe", "linear", "notion", "supabase", "raycast", "framer", "loom"];

export default function Home() {
  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      {/* ══════════ Top Nav ══════════ */}
      <header className="bg-background sticky top-0 z-50 border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Wordmark />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {/* Signed in: single dashboard CTA */}
            <Show when="signed-in">
              <Button size="sm" render={<Link href="/dashboard" />}>
                Open dashboard
              </Button>
            </Show>
            {/* Signed out: sign-in link + primary CTA */}
            <Show when="signed-out">
              <>
                <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
                  Sign in
                </Button>
                <Button size="sm" render={<Link href="/sign-up" />}>
                  Try Codeium
                </Button>
              </>
            </Show>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ══════════ Hero — cream band, 6/6 grid ══════════ */}
        <section className="border-border relative overflow-hidden border-b">
          {/* floating decorative shapes */}
          <div
            aria-hidden
            className="border-primary/25 pointer-events-none absolute -top-10 right-[8%] size-24 animate-[float_7s_ease-in-out_infinite] rounded-full border-[3px]"
          />
          <div
            aria-hidden
            className="bg-primary/15 pointer-events-none absolute bottom-16 left-[4%] size-3 animate-[float_5s_ease-in-out_1s_infinite] rounded-full"
          />
          <div
            aria-hidden
            className="text-primary/20 pointer-events-none absolute top-24 left-[38%] hidden animate-[spin-slow_24s_linear_infinite] lg:block"
          >
            <SpikeMark className="size-10" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:py-28 lg:grid-cols-[5fr_6fr] lg:gap-16">
            <div>
              <span className="hero-enter mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
                <SpikeMark className="text-primary size-3 animate-[spin-slow_12s_linear_infinite]" />
                AI code review for GitHub
              </span>
              <h1
                className="font-display hero-enter text-balance text-5xl leading-[1.05] tracking-tight md:text-[64px] md:leading-[1.02]"
                style={{ animationDelay: "120ms" }}
              >
                Every push deserves a{" "}
                <em className="text-primary not-italic">good review.</em>
              </h1>
              <p
                className="text-muted-foreground hero-enter mt-6 max-w-md text-lg leading-relaxed"
                style={{ animationDelay: "240ms" }}
              >
                Codeium watches your repos, reviews every diff with AI, and
                posts actionable feedback straight to GitHub — before your
                teammates even look.
              </p>
              <div
                className="hero-enter mt-8 flex flex-wrap items-center gap-3"
                style={{ animationDelay: "360ms" }}
              >
                <Show
                  when="signed-in"
                  fallback={
                    <Button size="lg" className="gap-2 px-6" render={<Link href="/sign-up" />}>
                      Connect GitHub
                      <ArrowRight className="size-4" />
                    </Button>
                  }
                >
                  <Button size="lg" className="gap-2 px-6" render={<Link href="/dashboard" />}>
                    Open dashboard
                    <ArrowRight className="size-4" />
                  </Button>
                </Show>
                <Button variant="outline" size="lg" render={<a href="#how-it-works" />}>
                  See how it works
                </Button>
              </div>
              <p
                className="text-muted-foreground/70 hero-enter mt-10 text-sm"
                style={{ animationDelay: "480ms" }}
              >
                Free for 3 repos · No credit card required
              </p>
            </div>

            {/* dark product mockup — 3D tilt */}
            <div
              className="hero-enter [perspective:1100px]"
              style={{ animationDelay: "300ms" }}
            >
              <TiltCard>
                <CodePreview />
              </TiltCard>
            </div>
          </div>
        </section>

        {/* ══════════ Logo strip — soft cream band ══════════ */}
        <section className="border-b border-secondary overflow-hidden bg-secondary">
          <p className="pt-8 text-center text-sm text-muted-foreground">
            Trusted by engineering teams shipping every day
          </p>
          <div className="relative mt-6 pb-8">
            <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <div className="flex shrink-0 animate-[marquee_30s_linear_infinite] items-center gap-14 pr-14">
                {[...logos, ...logos].map((name, i) => (
                  <span
                    key={i}
                    className="font-display whitespace-nowrap text-2xl text-muted-foreground/50"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ Feature cards — surface-card cream ══════════ */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <div className="max-w-xl">
                <p className="text-primary mb-3 font-mono text-xs uppercase tracking-widest">
                  Features
                </p>
                <h2 className="font-display text-4xl leading-tight tracking-tight text-balance md:text-[44px]">
                  Reviews that read like a senior wrote them
                </h2>
                <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                  Not nitpicks. Real findings with severity, file references,
                  and concrete fixes.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "Reviews in seconds",
                  body: "Every push and PR gets analyzed the moment it lands. Feedback posts to GitHub before your CI finishes warming up.",
                },
                {
                  icon: ShieldCheck,
                  title: "Security-first lens",
                  body: "Injection, auth gaps, SSRF, leaked secrets — flagged as criticals with exploit scenarios and minimal fixes.",
                },
                {
                  icon: MessagesSquare,
                  title: "Diagrams & verdicts",
                  body: "Complex changes come back with Mermaid architecture diagrams and a clear approve / request-changes verdict.",
                },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 120}>
                  <div className="group h-full rounded-xl bg-card p-8 transition-transform duration-300 hover:-translate-y-1.5">
                    <span className="mb-5 flex size-10 items-center justify-center rounded-lg bg-background ring-1 ring-border transition-colors group-hover:ring-primary/40">
                      <f.icon className="text-primary size-5 transition-transform duration-300 group-hover:scale-110" />
                    </span>
                    <h3 className="text-lg font-medium">{f.title}</h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {f.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ How it works — dark band ══════════ */}
        <section id="how-it-works" className="bg-surface-dark py-24 text-on-dark">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <Reveal>
                <div>
                  <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#d9a58c]">
                    How it works
                  </p>
                  <h2 className="font-display text-4xl leading-tight tracking-tight text-balance text-on-dark md:text-[44px]">
                    Three steps. Zero configuration.
                  </h2>
                  <ol className="mt-10 space-y-8">
                    {[
                      {
                        n: "01",
                        t: "Install the GitHub App",
                        d: "Pick the repos you want reviewed. Read-only access to just those — nothing else.",
                      },
                      {
                        n: "02",
                        t: "Choose your AI model",
                        d: "Bring any OpenAI-compatible provider. Paste a base URL + key, pick from hundreds of models.",
                      },
                      {
                        n: "03",
                        t: "Push code",
                        d: "Every commit and PR returns a structured review — summary, severity-tagged findings, diagrams, verdict.",
                      },
                    ].map((s, i) => (
                      <Reveal key={s.n} delay={i * 140}>
                        <li className="flex gap-5">
                          <span className="font-display shrink-0 text-3xl text-[#d97757]">
                            {s.n}
                          </span>
                          <div>
                            <h3 className="font-medium">{s.t}</h3>
                            <p className="mt-1 text-on-dark-soft leading-relaxed">
                              {s.d}
                            </p>
                          </div>
                        </li>
                      </Reveal>
                    ))}
                  </ol>
                </div>
              </Reveal>

              {/* terminal mockup — types itself on scroll */}
              <Reveal delay={150}>
                <TiltCard max={5}>
                  <div className="overflow-hidden rounded-xl bg-surface-dark-elevated ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                      <span className="font-mono text-xs text-on-dark-soft">
                        terminal
                      </span>
                      <GitPullRequestArrow className="size-4 text-on-dark-soft" />
                    </div>
                    <TypedTerminal
                      className="min-h-[340px] space-y-2 p-6 font-mono text-[13px] leading-7"
                      lines={[
                        <p key="1" className="text-on-dark-soft">$ git push origin main</p>,
                        <p key="2" className="text-emerald-400">✓ webhook received · delivery 8daf2f2c</p>,
                        <p key="3" className="text-emerald-400">✓ diff fetched · 3 files (+62 −0)</p>,
                        <p key="4" className="text-teal">⟳ analyzing with claude-sonnet…</p>,
                        <p key="5" className="text-emerald-400">✓ review posted to GitHub</p>,
                        <p key="6" className="text-on-dark-soft pt-3">
                          → <span className="text-[#d97757]">[critical]</span> SQL injection via string concat
                        </p>,
                        <p key="7" className="text-on-dark-soft">
                          → <span className="text-warning">[warning]</span> missing fetch timeout
                        </p>,
                        <p key="8" className="text-on-dark-soft">
                          → verdict: <span className="text-red-400">changes requested</span>
                        </p>,
                      ]}
                    />
                  </div>
                </TiltCard>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══════════ Testimonials ══════════ */}
        <Testimonials />

        {/* ══════════ FAQ ══════════ */}
        <Faq />

        {/* ══════════ Coral callout band ══════════ */}
        <section className="px-4 pb-24">
          <Reveal>
            <div className="bg-primary mx-auto max-w-6xl rounded-xl px-6 py-16 text-center text-white md:py-20">
              <h2 className="font-display mx-auto max-w-2xl text-4xl leading-tight tracking-tight text-balance md:text-5xl">
                Your next push deserves better than a rubber stamp.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
                Set up Codeium in under two minutes and let every commit come
                back reviewed.
            </p>
            <div className="mt-8">
              <Show
                when="signed-out"
                fallback={
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 bg-canvas px-8 text-primary hover:bg-canvas/90"
                    render={<Link href="/dashboard" />}
                  >
                    Open dashboard
                    <ArrowRight className="size-4" />
                  </Button>
                }
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-canvas px-8 text-primary hover:bg-canvas/90"
                  render={<Link href="/sign-up" />}
                >
                  Start reviewing free
                  <ArrowRight className="size-4" />
                </Button>
              </Show>
            </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ══════════ Dark footer ══════════ */}
      <footer className="bg-surface-dark overflow-hidden pt-10 text-on-dark-soft">
        {/* giant watermark wordmark — full-bleed, edge-to-edge */}
        <div aria-hidden className="pointer-events-none relative select-none">
          <p className="font-display -mb-[4vw] whitespace-nowrap text-center text-[19.5vw] font-medium leading-[0.78] tracking-tight text-on-dark/[0.06]">
            codeium
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-10">
            <p className="text-sm">
              © {new Date().getFullYear()} Codeium. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm transition-colors hover:text-on-dark"
              >
                Privacy
              </Link>
              <Link
                href="/privacy#terms"
                className="text-sm transition-colors hover:text-on-dark"
              >
                Policy
              </Link>
            </div>
          </div>
          <div className="pb-16" />
        </div>
      </footer>
    </div>
  );
}