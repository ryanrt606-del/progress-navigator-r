import { Calendar, ListChecks } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { getCompletion, formatDate, type PlanWithSteps } from "@/hooks/usePlans";

interface PlanCardProps {
  plan: PlanWithSteps;
  onClick: () => void;
}

export function PlanCard({ plan, onClick }: PlanCardProps) {
  const pct = getCompletion(plan.steps);
  const done = plan.steps.filter((s) => s.completed).length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group rounded-2xl bg-card border border-border p-5 hover:border-primary/40 hover:shadow-[0_4px_24px_-4px_hsl(20_100%_60%/0.2)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-2">
          {plan.title}
        </h3>
        <span className="shrink-0 text-sm font-bold text-gradient">{pct}%</span>
      </div>

      <ProgressBar percent={pct} className="mb-3" />

      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <ListChecks size={13} />
        <span>
          {done} / {plan.steps.length} tasks
        </span>
        <span className="ml-auto opacity-60 flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(plan.createdAt)}
        </span>
      </div>
    </button>
  );
}
