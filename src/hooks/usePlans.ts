import { useState, useEffect, useCallback } from "react";
import { db, type Plan, type Step } from "@/lib/db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function parsePlanText(text: string): Omit<Step, "planId">[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .map((line, idx) => {
      const cleaned = line.replace(/^(\d+[\.\)]|[-•*─])\s+/, "").trim();
      if (!cleaned) return null;
      return { id: generateId(), text: cleaned, completed: false, order: idx };
    })
    .filter(Boolean) as Omit<Step, "planId">[];
}

export function getCompletion(steps: Step[]) {
  if (steps.length === 0) return 0;
  return Math.round((steps.filter((s) => s.completed).length / steps.length) * 100);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Plan with steps (view model) ─────────────────────────────────────────────

export interface PlanWithSteps extends Plan {
  steps: Step[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlans() {
  const [plans, setPlans] = useState<PlanWithSteps[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [allPlans, allSteps] = await Promise.all([
      db.plans.orderBy("createdAt").reverse().toArray(),
      db.steps.toArray(),
    ]);

    const enriched: PlanWithSteps[] = allPlans.map((plan) => ({
      ...plan,
      steps: allSteps
        .filter((s) => s.planId === plan.id)
        .sort((a, b) => a.order - b.order),
    }));

    setPlans(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Create ──────────────────────────────────────────────────────────────────

  const createPlan = useCallback(
    async (title: string, rawSteps: Omit<Step, "planId">[]) => {
      const plan: Plan = {
        id: generateId(),
        title: title.trim(),
        createdAt: new Date().toISOString(),
      };
      const steps: Step[] = rawSteps.map((s) => ({ ...s, planId: plan.id }));

      await db.transaction("rw", db.plans, db.steps, async () => {
        await db.plans.add(plan);
        if (steps.length > 0) await db.steps.bulkAdd(steps);
      });

      await refresh();
      return plan.id;
    },
    [refresh]
  );

  // ── Update plan title ────────────────────────────────────────────────────────

  const updatePlanTitle = useCallback(
    async (planId: string, title: string) => {
      await db.plans.update(planId, { title: title.trim() });
      await refresh();
    },
    [refresh]
  );

  // ── Toggle step ──────────────────────────────────────────────────────────────

  const toggleStep = useCallback(
    async (stepId: string, completed: boolean) => {
      await db.steps.update(stepId, { completed });

      // Record a history entry only when marking complete (not uncomplete)
      if (completed) {
        const step = await db.steps.get(stepId);
        if (step) {
          await db.history.add({
            planId: step.planId,
            taskId: stepId,
            completedAt: new Date().toISOString(),
          });
        }
      }

      await refresh();
    },
    [refresh]
  );

  // ── Edit step text ───────────────────────────────────────────────────────────

  const updateStepText = useCallback(
    async (stepId: string, text: string) => {
      await db.steps.update(stepId, { text: text.trim() });
      await refresh();
    },
    [refresh]
  );

  // ── Add step ─────────────────────────────────────────────────────────────────

  const addStep = useCallback(
    async (planId: string, text: string, order: number) => {
      const step: Step = {
        id: generateId(),
        planId,
        text: text.trim(),
        completed: false,
        order,
      };
      await db.steps.add(step);
      await refresh();
    },
    [refresh]
  );

  // ── Delete step ───────────────────────────────────────────────────────────────

  const deleteStep = useCallback(
    async (stepId: string) => {
      await db.steps.delete(stepId);
      await refresh();
    },
    [refresh]
  );

  // ── Reset plan ────────────────────────────────────────────────────────────────

  const resetPlan = useCallback(
    async (planId: string) => {
      const stepsToReset = await db.steps.where("planId").equals(planId).toArray();
      await db.steps.bulkPut(stepsToReset.map((s) => ({ ...s, completed: false })));
      await refresh();
    },
    [refresh]
  );

  // ── Delete plan ───────────────────────────────────────────────────────────────

  const deletePlan = useCallback(
    async (planId: string) => {
      await db.transaction("rw", db.plans, db.steps, db.history, async () => {
        await db.plans.delete(planId);
        await db.steps.where("planId").equals(planId).delete();
        await db.history.where("planId").equals(planId).delete();
      });
      await refresh();
    },
    [refresh]
  );

  return {
    plans,
    loading,
    createPlan,
    updatePlanTitle,
    toggleStep,
    updateStepText,
    addStep,
    deleteStep,
    resetPlan,
    deletePlan,
  };
}
