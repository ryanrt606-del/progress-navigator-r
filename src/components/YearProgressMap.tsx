import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useYearProgress, type DayData } from "@/hooks/useYearProgress";

function cellColor(count: number): string {
  if (count === 0) return "hsl(var(--secondary))";
  if (count <= 2) return "hsl(20 100% 60% / 0.30)";
  if (count <= 5) return "hsl(20 100% 60% / 0.62)";
  return "hsl(20 100% 60%)";
}

function buildWeeks(days: DayData[]): DayData[][] {
  if (days.length === 0) return [];
  const first = new Date(days[0].date + "T12:00:00");
  const firstDow = first.getDay();

  const padded: (DayData | null)[] = [
    ...Array(firstDow).fill(null),
    ...days,
  ];

  const weeks: DayData[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const week = padded.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week.map((d) => d ?? { date: "", count: -1, label: "" }));
  }
  return weeks;
}

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface TooltipState {
  label: string;
  x: number;
  y: number;
}

export function YearProgressMap() {
  const { yearData, loading } = useYearProgress();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const weeks = buildWeeks(yearData);

  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, wi) => {
    const firstReal = week.find((d) => d.count >= 0 && d.date);
    if (firstReal) {
      const d = new Date(firstReal.date + "T12:00:00");
      if (d.getDate() <= 7) {
        const m = d.toLocaleDateString("en-US", { month: "short" });
        if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== m) {
          monthLabels.push({ label: m, col: wi });
        }
      }
    }
  });

  function handleCellEnter(e: React.MouseEvent, day: DayData) {
    if (!day.date || day.count < 0) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    setTooltip({
      label: day.label,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
    });
  }

  function handleCellLeave() {
    setTooltip(null);
  }

  const totalCompletions = yearData.reduce((sum, d) => sum + Math.max(0, d.count), 0);
  const activeDays = yearData.filter((d) => d.count > 0).length;

  const CELL = 11;
  const GAP = 3;

  return (
    <div className="rounded-2xl card-glass p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand-sm">
            <CalendarDays size={14} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Year Progress</h3>
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} productivity heatmap
            </p>
          </div>
        </div>
        {!loading && totalCompletions > 0 && (
          <div className="text-right">
            <p className="text-xs font-bold text-gradient">{totalCompletions}</p>
            <p className="text-[10px] text-muted-foreground">{activeDays}d active</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-28 bg-secondary/40 rounded-xl animate-pulse" />
      ) : (
        <div ref={containerRef} className="relative overflow-x-auto">
          {/* Month labels row */}
          <div className="flex mb-1.5 ml-5" style={{ gap: GAP }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.col === wi);
              return (
                <div
                  key={wi}
                  style={{ width: CELL, minWidth: CELL, fontSize: 9 }}
                  className="text-muted-foreground text-center"
                >
                  {ml ? ml.label : ""}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex" style={{ gap: GAP }}>
            {/* Day-of-week labels */}
            <div className="flex flex-col mr-0.5" style={{ gap: GAP }}>
              {DOW_LABELS.map((d, i) => (
                <div
                  key={i}
                  style={{ width: 12, height: CELL, fontSize: 9 }}
                  className="text-muted-foreground flex items-center justify-end pr-0.5"
                >
                  {i % 2 === 1 ? d : ""}
                </div>
              ))}
            </div>

            {/* Columns = weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((day, di) => {
                  const isEmpty = !day.date || day.count < 0;
                  const isToday = day.date === new Date().toISOString().slice(0, 10);
                  return (
                    <motion.div
                      key={di}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 2.5,
                        backgroundColor: isEmpty ? "transparent" : cellColor(day.count),
                        cursor: isEmpty ? "default" : "pointer",
                        outline: isToday ? "1.5px solid hsl(var(--primary))" : "none",
                        outlineOffset: "1px",
                      }}
                      whileHover={isEmpty ? {} : { scale: 1.4, zIndex: 10 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      onMouseEnter={isEmpty ? undefined : (e) => handleCellEnter(e, day)}
                      onMouseLeave={isEmpty ? undefined : handleCellLeave}
                      onTouchStart={
                        isEmpty
                          ? undefined
                          : (e) => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect();
                              const containerRect = containerRef.current?.getBoundingClientRect();
                              if (!containerRect) return;
                              setTooltip({
                                label: day.label,
                                x: rect.left - containerRect.left + rect.width / 2,
                                y: rect.top - containerRect.top - 8,
                              });
                              setTimeout(() => setTooltip(null), 2000);
                            }
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-none absolute z-20 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground shadow-elevated whitespace-nowrap -translate-x-1/2 -translate-y-full"
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                {tooltip.label}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {[0, 1, 3, 6].map((n) => (
              <div
                key={n}
                style={{ width: CELL, height: CELL, borderRadius: 2.5, backgroundColor: cellColor(n) }}
              />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      )}
    </div>
  );
}
