import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Activity, TrendingUp } from "lucide-react";
import { useTimelineData } from "@/hooks/useTimelineData";

const C_START = "hsl(20 100% 60%)";
const C_END   = "hsl(330 90% 62%)";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm gap-2">
      <Activity size={26} className="opacity-20" />
      <p className="text-xs">Complete tasks to see your timeline</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{
        background: "hsl(222 20% 9% / 0.96)",
        border: "1px solid hsl(20 100% 60% / 0.2)",
        boxShadow: "0 0 20px hsl(20 100% 60% / 0.1)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <p className="text-muted-foreground mb-0.5 text-[11px]">{label}</p>
      <p className="font-bold text-foreground">
        {payload[0].value} task{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function ProgressTimeline() {
  const { data7, data30, loading } = useTimelineData();
  const [view, setView] = useState<"7" | "30">("7");

  const hasData7  = data7.some((d) => d.count > 0);
  const hasData30 = data30.some((d) => d.count > 0);
  const activeData    = view === "7" ? data7  : data30;
  const hasActiveData = view === "7" ? hasData7 : hasData30;

  return (
    <div className="py-1">
      {/* Section label + toggle */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Progress Timeline
          </span>
        </div>

        {/* Pill toggle */}
        <div className="flex items-center gap-0.5 bg-secondary/50 rounded-xl p-1">
          {(["7", "30"] as const).map((v) => (
            <motion.button
              key={v}
              onClick={() => setView(v)}
              whileTap={{ scale: 0.9 }}
              className={`relative text-xs font-semibold px-3 py-1 rounded-lg transition-colors tap-highlight-none ${
                view === v ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {view === v && (
                <motion.div
                  layoutId="timeline-tab"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, hsl(20 100% 60% / 0.16), hsl(330 90% 62% / 0.16))",
                    boxShadow: "inset 0 0 0 1px hsl(20 100% 60% / 0.14)",
                  }}
                  transition={{ type: "spring", stiffness: 440, damping: 32 }}
                />
              )}
              <span className="relative">{v}d</span>
            </motion.button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-36 bg-secondary/20 rounded-xl animate-pulse" />
      ) : !hasActiveData ? (
        <EmptyState />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            {view === "7" ? (
              <ResponsiveContainer width="100%" height={155}>
                <BarChart data={activeData} margin={{ top: 4, right: 2, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C_START} />
                      <stop offset="100%" stopColor={C_END} stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border) / 0.3)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "hsl(var(--primary) / 0.05)", radius: 4 }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGrad)"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={28}
                    isAnimationActive={true}
                    animationDuration={700}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={155}>
                <LineChart data={activeData} margin={{ top: 4, right: 2, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={C_START} />
                      <stop offset="100%" stopColor={C_END} />
                    </linearGradient>
                    <filter id="lineGlow" x="-10%" y="-100%" width="120%" height="300%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border) / 0.3)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="url(#lineGrad)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: C_START,
                      strokeWidth: 0,
                      style: { filter: "drop-shadow(0 0 6px hsl(20 100% 60% / 0.85))" },
                    }}
                    style={{ filter: "url(#lineGlow)" }}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
