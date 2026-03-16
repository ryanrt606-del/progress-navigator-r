import { useState, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { useYearProgress, type DayData } from "@/hooks/useYearProgress";

// ── Colour intensity levels ────────────────────────────────────────────────────
function cellColor(count: number): string {
  if (count === 0) return "hsl(var(--secondary))";
  if (count <= 2) return "hsl(20 100% 60% / 0.35)";
  if (count <= 5) return "hsl(20 100% 60% / 0.65)";
  return "hsl(20 100% 60%)";
}

// ── Build weeks from a flat day array ─────────────────────────────────────────
function buildWeeks(days: DayData[]): DayData[][] {
  if (days.length === 0) return [];
  // Pad the first week so day[0] starts on correct weekday (0=Sun)
  const first = new Date(days[0].date + "T12:00:00");
  const firstDow = first.getDay(); // 0–6

  const padded: (DayData | null)[] = [
    ...Array(firstDow).fill(null),
    ...days,
  ];

  const weeks: DayData[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const week = padded.slice(i, i + 7);
    // Fill trailing nulls with empty placeholders
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

  // Month labels — find first week of each month
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

  const CELL = 11; // px size of each square
  const GAP = 3;   // px gap

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
          <CalendarDays size={13} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Year Progress</h3>
          <p className="text-xs text-muted-foreground">
            {new Date().getFullYear()} productivity heatmap
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-28 bg-secondary/40 rounded-xl animate-pulse" />
      ) : (
        <div ref={containerRef} className="relative overflow-x-auto">
          {/* Month labels row */}
          <div
            className="flex mb-1.5 ml-5"
            style={{ gap: GAP }}
          >
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

          {/* Grid: rows = days of week, cols = weeks */}
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
                    <div
                      key={di}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 2,
                        backgroundColor: isEmpty ? "transparent" : cellColor(day.count),
                        cursor: isEmpty ? "default" : "pointer",
                        outline: isToday ? "1.5px solid hsl(20 100% 60%)" : "none",
                        outlineOffset: "1px",
                        transition: "opacity 0.1s",
                      }}
                      onMouseEnter={isEmpty ? undefined : (e) => handleCellEnter(e, day)}
                      onMouseLeave={isEmpty ? undefined : handleCellLeave}
                      onTouchStart={
                        isEmpty
                          ? undefined
                          : (e) => {
                              const touch = e.touches[0];
                              const rect = (
                                e.target as HTMLElement
                              ).getBoundingClientRect();
                              const containerRect =
                                containerRef.current?.getBoundingClientRect();
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
          {tooltip && (
            <div
              className="pointer-events-none absolute z-10 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground shadow-xl whitespace-nowrap -translate-x-1/2 -translate-y-full"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.label}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-xs text-muted-foreground">Less</span>
            {[0, 1, 3, 6].map((n) => (
              <div
                key={n}
                style={{ width: CELL, height: CELL, borderRadius: 2, backgroundColor: cellColor(n) }}
              />
            ))}
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      )}
    </div>
  );
}
