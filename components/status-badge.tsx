import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type ReviewStatus = "processing" | "completed" | "failed";

const styles: Record<ReviewStatus, { className: string; label: string; icon: React.ElementType }> = {
  processing: {
    className: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    label: "Processing",
    icon: Loader2,
  },
  completed: {
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    label: "Completed",
    icon: CheckCircle2,
  },
  failed: {
    className: "border-red-500/20 bg-red-500/10 text-red-500",
    label: "Failed",
    icon: XCircle,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ReviewStatus;
  className?: string;
}) {
  const s = styles[status];
  const Icon = s.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-mono text-[10px] uppercase tracking-wider font-medium",
        s.className,
        className
      )}
    >
      <Icon
        className={cn(
          "size-3",
          status === "processing" && "animate-spin"
        )}
      />
      {s.label}
    </Badge>
  );
}