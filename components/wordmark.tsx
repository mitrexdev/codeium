import Link from "next/link";
import { cn } from "@/lib/utils";

/** Anthropic-style radial spike mark — 4-spoke asterisk glyph */
export function SpikeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 1.5c.4 3.9.7 6.6 1.2 8.1.5 1.4 1.3 2.2 2.7 2.7 1.5.5 4.2.8 8.1 1.2v1c-3.9.4-6.6.7-8.1 1.2-1.4.5-2.2 1.3-2.7 2.7-.5 1.5-.8 4.2-1.2 8.1h-1c-.4-3.9-.7-6.6-1.2-8.1-.5-1.4-1.3-2.2-2.7-2.7C5.6 15.5 2.9 15.2-1 14.8v-1c3.9-.4 6.6-.7 8.1-1.2 1.4-.5 2.2-1.3 2.7-2.7.5-1.5.8-4.2 1.2-8.1h1z" />
    </svg>
  );
}

export function Wordmark({
  size = "md",
  href = "/",
  className,
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
}) {
  const sizes = {
    sm: { img: "h-4", fallback: "text-lg leading-none" },
    md: { img: "h-6", fallback: "text-[22px] leading-none" },
    lg: { img: "h-8", fallback: "text-3xl leading-none" },
  };
  const s = sizes[size];

  const content = (
    <>
      {/* light mode → dark-logo · dark mode → light-logo */}
      <img
        src="/dark-logo.svg"
        alt="Codeium"
        className={cn("w-auto dark:hidden", s.img)}
      />
      <img
        src="/light-logo.svg"
        alt="Codeium"
        className={cn("hidden w-auto dark:block", s.img)}
      />
    </>
  );

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={cn("inline-flex items-center", className)}>
      {content}
    </Link>
  );
}