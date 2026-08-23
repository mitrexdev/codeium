import type { ReactNode } from "react";
import { Wordmark } from "@/components/wordmark";

export function AuthLayout({
  children,
  heading,
  subheading,
  stats,
}: {
  children: ReactNode;
  heading: string;
  subheading: string;
  stats?: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {/* Left panel — dark editorial branding band */}
      <div className="bg-surface-dark text-on-dark relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <Wordmark size="lg" href={null} className="[&_span:last-child]:text-on-dark mb-10" />

          <h1 className="font-display text-balance mb-4 text-4xl leading-tight tracking-tight md:text-[42px]">
            {heading}
          </h1>
          <p className="text-on-dark-soft max-w-sm text-base leading-relaxed text-balance">
            {subheading}
          </p>

          {stats && (
            <div className="mt-12 grid grid-cols-3 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-primary text-3xl">
                    {s.value}
                  </div>
                  <div className="text-on-dark-soft/70 mt-1 text-xs">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-on-dark-soft/50 absolute bottom-8 font-mono text-xs uppercase tracking-widest">
          ai code review for github
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <Wordmark size="md" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
