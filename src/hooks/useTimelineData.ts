import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";

export interface TimelineDay {
  date: string;   // "Mon", "Tue" … for 7-day; "MM/DD" for 30-day
  fullDate: string; // "YYYY-MM-DD"
  count: number;
}

function toKey(iso: string) {
  return iso.slice(0, 10);
}

function buildRange(days: number): string[] {
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(toKey(d.toISOString()));
  }
  return result;
}

export function useTimelineData() {
  const [data7, setData7] = useState<TimelineDay[]>([]);
  const [data30, setData30] = useState<TimelineDay[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);

    const entries = await db.history
      .orderBy("completedAt")
      .filter((e) => e.completedAt >= thirtyAgo.toISOString())
      .toArray();

    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      const k = toKey(e.completedAt);
      counts[k] = (counts[k] ?? 0) + 1;
    });

    const range30 = buildRange(30);
    const range7 = buildRange(7);

    const make = (range: string[], short: boolean): TimelineDay[] =>
      range.map((key) => {
        const d = new Date(key + "T12:00:00");
        const label = short
          ? d.toLocaleDateString("en-US", { weekday: "short" })
          : d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
        return { date: label, fullDate: key, count: counts[key] ?? 0 };
      });

    setData7(make(range7, true));
    setData30(make(range30, false));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data7, data30, loading, refresh };
}
