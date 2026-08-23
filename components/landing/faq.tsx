import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does Codeium review my code?",
    a: "Once you install the Codeium GitHub App, it listens to every push and pull request on your selected repos. It fetches the diff, analyzes it with AI, and posts a review comment directly on GitHub — usually within a minute.",
  },
  {
    q: "Is my code safe?",
    a: "Yes. Codeium requests read-only access to only the repos you install it on. We never store your code — diffs are processed in memory for analysis and discarded. All webhook payloads are signature-verified.",
  },
  {
    q: "Which languages and frameworks are supported?",
    a: "All of them. Codeium works at the diff level with full-codebase context, so it reviews anything Git can track — TypeScript, Python, Go, Rust, YAML, Terraform, and more.",
  },
  {
    q: "Will it comment on every single line?",
    a: "No. Reviews are tuned to surface meaningful issues — bugs, security risks, missing edge cases, and logic errors — each tagged with severity and paired with a concrete fix.",
  },
  {
    q: "Can I use my own AI model?",
    a: "Yes. Paste any OpenAI-compatible base URL with your API key in Settings → Providers, and Codeium auto-fetches every model that provider offers. You choose which one reviews your code.",
  },
  {
    q: "What happens after the free tier?",
    a: "The free tier is free forever for up to 3 repos. When you outgrow it, upgrade to Pro for unlimited repos and deeper context — no migration needed.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <p className="text-primary mb-3 font-mono text-xs uppercase tracking-widest">
            FAQ
          </p>
          <h2 className="font-display text-4xl leading-tight tracking-tight text-balance md:text-[44px]">
            Questions, answered
          </h2>
        </div>

        {/* hairline editorial rows */}
        <Accordion multiple className="mt-12">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border px-0">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}