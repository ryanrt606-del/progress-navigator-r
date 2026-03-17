import { motion } from "framer-motion";
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
  const isComplete = pct === 100;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left group rounded-2xl card-glass p-5 hover:border-primary/30 transition-all duration-200 relative overflow-hidden tap-highlight-none"
      style={{
        borderColor: isComplete ? "hsl(20 100% 60% / 0.35)" : undefined,
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(20 100% 60% / 0.07), transparent 70%)" }}
      />

      {/* Complete badge */}
      {isComplete && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full gradient-brand px-2.5 py-0.5 shadow-brand-sm">
          <span className="text-[10px] font-bold text-white tracking-wide">DONE</span>
        </div>
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-2 pr-2">
            {plan.title}
          </h3>
          {!isComplete && (
            <span className="shrink-0 text-sm font-bold text-gradient">{pct}%</span>
          )}
        </div>

        <ProgressBar percent={pct} className="mb-3.5" />

        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <ListChecks size={12} />
          <span className="font-medium">
            {done}
            <span className="text-muted-foreground/60"> / {plan.steps.length}</span>
          </span>
          <span className="ml-auto opacity-50 flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(plan.createdAt)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
