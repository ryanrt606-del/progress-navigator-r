import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { YearProgressMap } from "@/components/YearProgressMap";
import { useTimelineData } from "@/hooks/useTimelineData";
import { useYearProgress } from "@/hooks/useYearProgress";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function StatsScreen() {
  const { data7 } = useTimelineData();
  const { yearData } = useYearProgress();

  const totalThisWeek = data7.reduce((s, d) => s + d.count, 0);
  const totalThisYear = yearData.reduce((s, d) => s + Math.max(0, d.count), 0);
  const activeDays = yearData.filter((d) => d.count > 0).length;
  const bestDay = Math.max(...yearData.map((d) => d.count), 0);

  const year = new Date().getFullYear();

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="max-w-xl mx-auto px-4 pt-14 pb-6">

        {/* Header */}
        <motion.div
          className="mb-7"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your productivity at a glance</p>
        </motion.div>

        {/* Quick stat pills */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {[
            { label: "This week", value: totalThisWeek, unit: "tasks", icon: "📅" },
            { label: `${year} total`, value: totalThisYear, unit: "tasks", icon: "🏆" },
            { label: "Active days", value: activeDays, unit: "days", icon: "🔥" },
            { label: "Best day", value: bestDay, unit: "tasks", icon: "⚡" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="rounded-2xl card-glass p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.unit}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-foreground leading-none mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProgressTimeline />
        </motion.div>

        {/* Year heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <YearProgressMap />
        </motion.div>
      </div>
    </div>
  );
}
