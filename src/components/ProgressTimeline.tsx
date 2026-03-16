import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, TrendingUp } from "lucide-react";
import { useTimelineData } from "@/hooks/useTimelineData";

const GRADIENT_START = "hsl(20 100% 60%)";
const GRADIENT_END = "hsl(330 90% 62%)";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm gap-2">
      <Activity size={28} className="opacity-30" />
      <p>Complete tasks to see your timeline</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold text-foreground">
        {payload[0].value} task{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function ProgressTimeline() {
  const { data7, data30, loading } = useTimelineData();
  const [view, setView] = useState<"7" | "30">("7");

  const hasData7 = data7.some((d) => d.count > 0);
  const hasData30 = data30.some((d) => d.count > 0);
  const activeData = view === "7" ? data7 : data30;
  const hasActiveData = view === "7" ? hasData7 : hasData30;

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <TrendingUp size={13} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Progress Timeline</h3>
            <p className="text-xs text-muted-foreground">Tasks completed over time</p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex items-center bg-secondary rounded-lg p-0.5 gap-0.5">
          {(["7", "30"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                view === v
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-40 bg-secondary/40 rounded-xl animate-pulse" />
      ) : !hasActiveData ? (
        <EmptyState />
      ) : view === "7" ? (
        /* ── 7-day Bar chart ── */
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data7} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GRADIENT_START} />
                <stop offset="100%" stopColor={GRADIENT_END} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))" }} />
            <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        /* ── 30-day Line chart ── */
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data30} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={GRADIENT_START} />
                <stop offset="100%" stopColor={GRADIENT_END} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
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
              activeDot={{ r: 4, fill: GRADIENT_START, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
