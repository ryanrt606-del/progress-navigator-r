import { motion } from "framer-motion";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { YearProgressMap } from "@/components/YearProgressMap";
import { useTimelineData } from "@/hooks/useTimelineData";
import { useYearProgress } from "@/hooks/useYearProgress";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp  = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const } },
};

const STATS_ICONS = ["📅", "🏆", "🔥", "⚡"];

export function StatsScreen() {
  const { data7 }    = useTimelineData();
  const { yearData } = useYearProgress();

  const totalThisWeek = data7.reduce((s, d) => s + d.count, 0);
  const totalThisYear = yearData.reduce((s, d) => s + Math.max(0, d.count), 0);
  const activeDays    = yearData.filter((d) => d.count > 0).length;
  const bestDay       = Math.max(...yearData.map((d) => d.count), 0);
  const year          = new Date().getFullYear();

  const statItems = [
    { icon: STATS_ICONS[0], label: "This week", value: totalThisWeek, unit: "tasks" },
    { icon: STATS_ICONS[1], label: `${year} total`, value: totalThisYear, unit: "tasks" },
    { icon: STATS_ICONS[2], label: "Active days", value: activeDays, unit: "days" },
    { icon: STATS_ICONS[3], label: "Best day", value: bestDay, unit: "tasks" },
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
          <h1 className="text-[1.6rem] font-extrabold tracking-tight">
            Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your productivity at a glance</p>
        </motion.div>

        {/* Inline stat items — no heavy cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <div className="grid grid-cols-2 gap-px rounded-2xl overflow-hidden"
            style={{
              background: "hsl(var(--border) / 0.4)",
              boxShadow: "0 0 0 1px hsl(var(--border) / 0.4)",
            }}
          >
            {statItems.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="flex items-center gap-3 p-4"
                style={{ background: "linear-gradient(160deg, hsl(222 18% 10%), hsl(222 14% 8%))" }}
              >
                <span className="text-2xl leading-none">{stat.icon}</span>
                <div>
                  <p className="text-xl font-extrabold text-foreground leading-none tabular-nums">
                    {stat.value}
                    <span className="text-muted-foreground/40 text-xs font-normal ml-1">{stat.unit}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline — borderless, blends into bg */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
          <ProgressTimeline />
        </motion.div>

        {/* Year heatmap — borderless */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
          <YearProgressMap />
        </motion.div>

      </div>
    </div>
  );
}
