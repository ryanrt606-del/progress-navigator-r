import Dexie, { type EntityTable } from "dexie";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Step {
  id: string;
  planId: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface Plan {
  id: string;
  title: string;
  createdAt: string;
}

export interface HistoryEntry {
  id?: number; // auto-increment
  planId: string;
  taskId: string;
  completedAt: string; // ISO date string
}

// ─── Database ─────────────────────────────────────────────────────────────────

class ProgressTrackerDB extends Dexie {
  plans!: EntityTable<Plan, "id">;
  steps!: EntityTable<Step, "id">;
  history!: EntityTable<HistoryEntry, "id">;

  constructor() {
    super("ProgressTrackerDB");
    this.version(1).stores({
      plans: "id, createdAt",
      steps: "id, planId, order",
    });
    // Version 2: add history table
    this.version(2).stores({
      plans: "id, createdAt",
      steps: "id, planId, order",
      history: "++id, planId, taskId, completedAt",
    });
  }
}

export const db = new ProgressTrackerDB();
