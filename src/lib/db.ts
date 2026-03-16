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

// ─── Database ─────────────────────────────────────────────────────────────────

class ProgressTrackerDB extends Dexie {
  plans!: EntityTable<Plan, "id">;
  steps!: EntityTable<Step, "id">;

  constructor() {
    super("ProgressTrackerDB");
    this.version(1).stores({
      plans: "id, createdAt",
      steps: "id, planId, order",
    });
  }
}

export const db = new ProgressTrackerDB();
