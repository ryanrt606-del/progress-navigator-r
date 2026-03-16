import { useCallback } from "react";
import { db, type HistoryEntry } from "@/lib/db";

/** Returns helpers to record and query task-completion history from IndexedDB */
export function useProgressHistory() {
  /** Call this every time a task is marked complete */
  const recordCompletion = useCallback(
    async (planId: string, taskId: string) => {
      const entry: HistoryEntry = {
        planId,
        taskId,
        completedAt: new Date().toISOString(),
      };
      await db.history.add(entry);
    },
    []
  );

  /** Returns all history entries within a date range (ISO strings) */
  const getHistory = useCallback(
    async (fromISO?: string, toISO?: string): Promise<HistoryEntry[]> => {
      let col = db.history.orderBy("completedAt");
      const all = await col.toArray();
      return all.filter((e) => {
        if (fromISO && e.completedAt < fromISO) return false;
        if (toISO && e.completedAt > toISO) return false;
        return true;
      });
    },
    []
  );

  return { recordCompletion, getHistory };
}
