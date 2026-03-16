import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";

export interface DayData {
  date: string; // "YYYY-MM-DD"
  count: number;
  label: string; // e.g. "March 16 — 5 tasks completed"
}

/** Aggregates full-year history into per-day counts for the heatmap */
export function useYearProgress() {
  const [yearData, setYearData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const fromISO = yearStart.toISOString();

    const entries = await db.history
      .orderBy("completedAt")
      .filter((e) => e.completedAt >= fromISO)
      .toArray();

    // Aggregate by date key
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      const day = e.completedAt.slice(0, 10);
      counts[day] = (counts[day] ?? 0) + 1;
    });

    // Build a full 365-day array from Jan 1 → Dec 31 of this year
    const days: DayData[] = [];
    const cursor = new Date(yearStart);
    const yearEnd = new Date(now.getFullYear(), 11, 31);

    while (cursor <= yearEnd) {
      const key = cursor.toISOString().slice(0, 10);
      const count = counts[key] ?? 0;
      const formatted = cursor.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      days.push({
        date: key,
        count,
        label:
          count === 0
            ? `${formatted} — no tasks`
            : `${formatted} — ${count} task${count === 1 ? "" : "s"} completed`,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    setYearData(days);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { yearData, loading, refresh };
}
