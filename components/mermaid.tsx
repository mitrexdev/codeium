"use client";

import { useEffect, useId, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#7c3aed",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#a78bfa",
            lineColor: "#71717a",
            secondaryColor: "#27272a",
            tertiaryColor: "#18181b",
            background: "transparent",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "13px",
          },
          securityLevel: "strict",
        });
        const { svg } = await mermaid.render(`codeium-mmd-${id}`, chart);
        if (!cancelled) setSvg(svg);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (failed) {
    return (
      <pre className="my-2 overflow-x-auto rounded-xl border border-border/50 bg-muted/30 p-3">
        <code className="block whitespace-pre font-mono text-xs leading-relaxed">
          {chart}
        </code>
      </pre>
    );
  }

  return (
    <div
      className="my-3 flex justify-center overflow-x-auto rounded-xl border border-border/50 bg-muted/20 p-4"
      // mermaid.render output is sanitized by securityLevel:"strict"
      dangerouslySetInnerHTML={{ __html: svg ?? "" }}
    />
  );
}