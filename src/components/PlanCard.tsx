import { motion } from "framer-motion";
import { Calendar, ListChecks, ChevronRight } from "lucide-react";
import { getCompletion, formatDate, type PlanWithSteps } from "@/hooks/usePlans";

interface PlanCardProps {
  plan: PlanWithSteps;
  onClick: () => void;
}

export function PlanCard({ plan, onClick }: PlanCardProps) {
  const pct        = getCompletion(plan.steps);
  const done       = plan.steps.filter((s) => s.completed).length;
  const isComplete = pct === 100;
  const isActive   = pct > 0 && pct < 100;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.968 }}
      className="w-full text-left group rounded-2xl tap-highlight-none relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, hsl(222 18% 10%), hsl(222 14% 7%))",
        boxShadow: isComplete
          ? "0 0 0 1px hsl(20 100% 60% / 0.28), 0 0 18px hsl(20 100% 60% / 0.08), 0 4px 24px hsl(222 20% 2% / 0.6)"
          : isActive
            ? "0 0 0 1px hsl(var(--border) / 0.6), 0 0 12px hsl(20 100% 60% / 0.04), 0 4px 20px hsl(222 20% 2% / 0.5)"
            : "0 0 0 1px hsl(var(--border) / 0.45), 0 2px 16px hsl(222 20% 2% / 0.5)",
        transition: "box-shadow 0.35s ease, transform 0.18s ease",
      }}
    >
      {/* Hover ambient glow — only on active/incomplete */}
      {!isComplete && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% -10%, hsl(20 100% 60% / 0.06), transparent 60%)",
          }}
        />
      )}

      {/* Top stripe for completed plans */}
      {isComplete && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "var(--gradient-brand)" }}
        />
      )}

      <div className="relative p-4 flex items-center gap-3.5">
        {/* Progress ring */}
        <div className="relative shrink-0">
          <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
            {/* Track */}
            <circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="2.5"
            />
            {/* Progress arc */}
            <motion.circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke="url(#ring-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - pct / 100) }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              style={isComplete ? { filter: "drop-shadow(0 0 4px hsl(20 100% 60% / 0.55))" } : {}}
            />
            <defs>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(20 100% 60%)" />
                <stop offset="100%" stopColor="hsl(330 90% 62%)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">
            {pct}%
          </span>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-foreground text-[0.875rem] leading-snug line-clamp-2">
              {plan.title}
            </h3>
            {isComplete ? (
              <span className="shrink-0 flex items-center gap-1 rounded-full gradient-brand px-2 py-0.5 shadow-brand-sm">
                <span className="text-[9px] font-bold text-white tracking-wide">DONE</span>
              </span>
            ) : (
              <ChevronRight
                size={14}
                className="shrink-0 text-muted-foreground/20 group-hover:text-primary/40 transition-colors mt-0.5"
              />
            )}
          </div>

          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <ListChecks size={11} />
              <span className="font-medium tabular-nums">
                {done}
                <span className="text-muted-foreground/35"> / {plan.steps.length}</span>
              </span>
            </span>
            <span className="flex items-center gap-1 opacity-35">
              <Calendar size={10} />
              {formatDate(plan.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Thin bottom progress track */}
      <div className="relative h-0.5 mx-4 mb-3.5 rounded-full bg-secondary/40 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: "var(--gradient-brand)",
            boxShadow: isActive || isComplete ? "0 0 6px hsl(20 100% 60% / 0.4)" : "none",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.button>
  );
}
