import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useYearProgress, type DayData } from "@/hooks/useYearProgress";

function cellColor(count: number): string {
  if (count === 0) return "hsl(222 16% 14%)";
  if (count <= 2)  return "hsl(20 100% 60% / 0.28)";
  if (count <= 5)  return "hsl(20 100% 60% / 0.58)";
  return "hsl(20 100% 60%)";
}

function cellGlow(count: number): string {
  if (count === 0) return "none";
  if (count <= 2)  return "0 0 6px hsl(20 100% 60% / 0.2)";
  if (count <= 5)  return "0 0 8px hsl(20 100% 60% / 0.4)";
  return "0 0 12px hsl(20 100% 60% / 0.7), 0 0 24px hsl(20 100% 60% / 0.3)";
}

function buildWeeks(days: DayData[]): DayData[][] {
  if (days.length === 0) return [];
  const first    = new Date(days[0].date + "T12:00:00");
  const firstDow = first.getDay();
  const padded: (DayData | null)[] = [...Array(firstDow).fill(null), ...days];
  const weeks: DayData[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const week = padded.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week.map((d) => d ?? { date: "", count: -1, label: "" }));
  }
  return weeks;
}

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface TooltipState { label: string; x: number; y: number; }

export function YearProgressMap() {
  const { yearData, loading } = useYearProgress();
  const [tooltip, setTooltip]   = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const weeks = buildWeeks(yearData);

  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, wi) => {
    const firstReal = week.find((d) => d.count >= 0 && d.date);
    if (firstReal) {
      const d = new Date(firstReal.date + "T12:00:00");
      if (d.getDate() <= 7) {
        const m = d.toLocaleDateString("en-US", { month: "short" });
        if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== m)
          monthLabels.push({ label: m, col: wi });
      }
    }
  });

  function handleCellEnter(e: React.MouseEvent, day: DayData) {
    if (!day.date || day.count < 0) return;
    const rect          = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    setTooltip({ label: day.label, x: rect.left - containerRect.left + rect.width / 2, y: rect.top - containerRect.top - 8 });
  }

  const totalCompletions = yearData.reduce((sum, d) => sum + Math.max(0, d.count), 0);
  const activeDays       = yearData.filter((d) => d.count > 0).length;

  const CELL = 11;
  const GAP  = 3;

  return (
    <div className="py-1">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Year Progress
          </span>
        </div>
        {!loading && totalCompletions > 0 && (
          <div className="text-right">
            <span className="text-xs font-bold text-gradient">{totalCompletions}</span>
            <span className="text-[10px] text-muted-foreground ml-1.5">{activeDays}d active</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-28 bg-secondary/30 rounded-xl animate-pulse" />
      ) : (
        <div ref={containerRef} className="relative overflow-x-auto">
          {/* Month labels */}
          <div className="flex mb-1.5 ml-5" style={{ gap: GAP }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.col === wi);
              return (
                <div key={wi} style={{ width: CELL, minWidth: CELL, fontSize: 9 }} className="text-muted-foreground text-center">
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
                <div key={i} style={{ width: 12, height: CELL, fontSize: 9 }} className="text-muted-foreground flex items-center justify-end pr-0.5">
                  {i % 2 === 1 ? d : ""}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((day, di) => {
                  const isEmpty = !day.date || day.count < 0;
                  const isToday = day.date === new Date().toISOString().slice(0, 10);
                  return (
                    <motion.div
                      key={di}
                      style={{
                        width: CELL, height: CELL,
                        borderRadius: 2.5,
                        backgroundColor: isEmpty ? "transparent" : cellColor(day.count),
                        cursor: isEmpty ? "default" : "pointer",
                        outline: isToday ? "1.5px solid hsl(var(--primary))" : "none",
                        outlineOffset: "1px",
                        boxShadow: isEmpty ? "none" : cellGlow(day.count),
                      }}
                      whileHover={isEmpty ? {} : { scale: 1.5, zIndex: 10 }}
                      animate={{ boxShadow: isEmpty ? "none" : cellGlow(day.count) }}
                      transition={{ type: "spring", stiffness: 500, damping: 24, boxShadow: { duration: 0.3 } }}
                      onMouseEnter={isEmpty ? undefined : (e) => handleCellEnter(e, day)}
                      onMouseLeave={isEmpty ? undefined : () => setTooltip(null)}
                      onTouchStart={isEmpty ? undefined : (e) => {
                        const rect          = (e.target as HTMLElement).getBoundingClientRect();
                        const containerRect = containerRef.current?.getBoundingClientRect();
                        if (!containerRect) return;
                        setTooltip({ label: day.label, x: rect.left - containerRect.left + rect.width / 2, y: rect.top - containerRect.top - 8 });
                        setTimeout(() => setTooltip(null), 2000);
                      }}
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
                transition={{ duration: 0.14 }}
                className="pointer-events-none absolute z-20 rounded-xl px-3 py-2 text-xs text-foreground whitespace-nowrap -translate-x-1/2 -translate-y-full"
                style={{
                  left: tooltip.x, top: tooltip.y,
                  background: "hsl(222 20% 9%)",
                  border: "1px solid hsl(20 100% 60% / 0.25)",
                  boxShadow: "0 0 20px hsl(20 100% 60% / 0.15)",
                }}
              >
                {tooltip.label}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[9px] text-muted-foreground">Less</span>
            {[0, 1, 3, 6].map((n) => (
              <div
                key={n}
                style={{
                  width: CELL, height: CELL, borderRadius: 2.5,
                  backgroundColor: cellColor(n),
                  boxShadow: cellGlow(n),
                }}
              />
            ))}
            <span className="text-[9px] text-muted-foreground">More</span>
          </div>
        </div>
      )}
    </div>
  );
}
