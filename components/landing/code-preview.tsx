import { SpikeMark } from "@/components/wordmark";
import { Check } from "lucide-react";

/**
 * Dark product-mockup card — shows a real Codeium review comment
 * rendered inside a GitHub-like panel, per the design system's
 * "show actual product chrome" principle.
 */
export function CodePreview() {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-surface-dark ring-1 ring-black/20">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] text-on-dark-soft">
          github.com/acme/api · pull request #142
        </span>
      </div>

      <div className="space-y-4 p-6">
        {/* diff lines */}
        <div className="rounded-lg bg-surface-dark-soft p-4 font-mono text-[12px] leading-6">
          <div className="flex">
            <span className="w-8 select-none text-right text-[#57534e]">14</span>
            <span className="pl-4 text-[#a09d96]">export async function</span>
            <span className="text-[#d97757]"> getUser</span>
            <span className="text-on-dark">(id) {"{"}</span>
          </div>
          <div className="flex bg-red-500/10">
            <span className="w-8 select-none border-r border-red-500/30 text-right text-[#57534e]">15</span>
            <span className="pl-4 text-red-300">- return db.query(&apos;SELECT * FROM users WHERE id = &apos; + id)</span>
          </div>
          <div className="flex bg-emerald-500/10">
            <span className="w-8 select-none border-r border-emerald-500/40 text-right text-[#57534e]">15</span>
            <span className="pl-4 text-emerald-300">{"+ return db.user.findUnique({ where: { id } })"}</span>
          </div>
          <div className="flex">
            <span className="w-8 select-none text-right text-[#57534e]">16</span>
            <span className="pl-4 text-on-dark-soft">{"}"}</span>
          </div>
        </div>

        {/* review comment */}
        <div className="rounded-lg border border-white/10 bg-surface-dark-elevated p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="bg-primary flex size-6 items-center justify-center rounded-full">
              <SpikeMark className="size-3 text-white" />
            </span>
            <span className="text-sm font-medium text-on-dark">codeium</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#d9a58c]">
              bot · just now
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-on-dark-soft">
            Fixed SQL injection via parameterized query.{" "}
            <span className="font-medium text-on-dark">Approved.</span>
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
              <Check className="size-3" />
              approved
            </span>
            <span className="font-mono text-[10px] text-on-dark-soft/60">
              reviewed in 38s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}