const quotes = [
  {
    quote:
      "It caught a race condition our senior missed in review. The severity tags mean I only read what matters.",
    name: "Priya Sharma",
    role: "Staff Engineer, fintech",
  },
  {
    quote:
      "The diagrams sell it — every architecture PR comes back with a picture of what changed. Onboarding juniors got easier.",
    name: "Marcus Webb",
    role: "CTO, devtools startup",
  },
  {
    quote:
      "Brought my own model key, connected GitHub, forgot about it. Reviews just appear. Exactly how infra should feel.",
    name: "Elena Rossi",
    role: "Platform Lead, e-commerce",
  },
];

import { Reveal } from "@/components/landing/motion";

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="max-w-xl">
            <p className="text-primary mb-3 font-mono text-xs uppercase tracking-widest">
              Testimonials
            </p>
            <h2 className="font-display text-4xl leading-tight tracking-tight text-balance md:text-[44px]">
              Teams review differently now
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {quotes.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <figure className="flex h-full flex-col rounded-xl bg-card p-8">
                <blockquote className="font-display flex-1 text-xl leading-relaxed text-balance">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium ring-1 ring-border">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}