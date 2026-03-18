import { motion } from "framer-motion";
import { Calendar, ListChecks, ChevronRight } from "lucide-react";
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
      whileTap={{ scale: 0.975 }}
      className="w-full text-left group rounded-2xl card-glass p-5 hover:border-primary/25 transition-all duration-200 relative overflow-hidden tap-highlight-none"
      style={{
        borderColor: isComplete ? "hsl(20 100% 60% / 0.3)" : undefined,
      }}
    >
      {/* hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(20 100% 60% / 0.06), transparent 70%)" }}
      />

      <div className="relative flex items-start gap-3">
        {/* Progress ring indicator */}
        <div className="relative shrink-0 mt-0.5">
          <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="url(#ring-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 14}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 14 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 14 * (1 - pct / 100) }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(20 100% 60%)" />
                <stop offset="100%" stopColor="hsl(330 90% 62%)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground rotate-0">
            {pct}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
              {plan.title}
            </h3>
            {isComplete ? (
              <span className="shrink-0 flex items-center gap-1 rounded-full gradient-brand px-2 py-0.5 shadow-brand-sm">
                <span className="text-[9px] font-bold text-white tracking-wide">DONE</span>
              </span>
            ) : (
              <ChevronRight size={14} className="shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mt-0.5" />
            )}
          </div>

          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <ListChecks size={11} />
              <span className="font-medium">{done}<span className="text-muted-foreground/50"> / {plan.steps.length}</span></span>
            </span>
            <span className="flex items-center gap-1 opacity-50">
              <Calendar size={10} />
              {formatDate(plan.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
