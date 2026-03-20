import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { YearProgressMap } from "@/components/YearProgressMap";
import { useTimelineData } from "@/hooks/useTimelineData";
import { useYearProgress } from "@/hooks/useYearProgress";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const } },
};

/** Smooth count-up from 0 → target */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(target * ease));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

function StatChip({ icon, label, value, unit, delay }: {
  icon: string; label: string; value: number; unit: string; delay: number;
}) {
  const animated = useCountUp(value, 800);
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className="flex flex-col items-center justify-center gap-0.5 py-4 flex-1"
    >
      <span className="text-base leading-none mb-1">{icon}</span>
      <p className="text-lg font-extrabold text-foreground leading-none tabular-nums">
        {animated}
        <span className="text-[10px] text-muted-foreground/50 font-normal ml-0.5">{unit}</span>
      </p>
      <p className="text-[10px] text-muted-foreground text-center leading-tight">{label}</p>
    </motion.div>
  );
}

const DIVIDER = (
  <div className="w-px self-stretch my-3 bg-border/40 shrink-0" />
);

export function StatsScreen() {
  const { data7 }    = useTimelineData();
  const { yearData } = useYearProgress();

  const totalThisWeek = data7.reduce((s, d) => s + d.count, 0);
  const totalThisYear = yearData.reduce((s, d) => s + Math.max(0, d.count), 0);
  const activeDays    = yearData.filter((d) => d.count > 0).length;
  const bestDay       = Math.max(...yearData.map((d) => d.count), 0);
  const year          = new Date().getFullYear();

  const statItems = [
    { icon: "📅", label: "This week", value: totalThisWeek, unit: "tasks" },
    { icon: "🏆", label: `${year} total`, value: totalThisYear, unit: "tasks" },
    { icon: "🔥", label: "Active days", value: activeDays, unit: "days" },
    { icon: "⚡", label: "Best day", value: bestDay, unit: "tasks" },
  ];

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="max-w-xl mx-auto px-4 pt-14 pb-6 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[1.6rem] font-extrabold tracking-tight">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your productivity at a glance</p>
        </motion.div>

        {/* Single glass strip with 4 inline stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex items-stretch rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, hsl(222 18% 10% / 0.9), hsl(222 14% 7% / 0.9))",
            boxShadow: "0 0 0 1px hsl(var(--border) / 0.5), 0 4px 24px hsl(222 20% 2% / 0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {statItems.map((stat, i) => (
            <div key={stat.label} className="flex items-stretch flex-1 min-w-0">
              {i > 0 && DIVIDER}
              <StatChip {...stat} delay={i * 0.07} />
            </div>
          ))}
        </motion.div>

        {/* Timeline — borderless, blends into bg */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent mb-6" />
          <ProgressTimeline />
        </motion.div>

        {/* Year heatmap — borderless */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent mb-6" />
          <YearProgressMap />
        </motion.div>

      </div>
    </div>
  );
}
