import { useState } from "react";
import { usePlans } from "@/hooks/usePlans";
import { Dashboard } from "@/components/Dashboard";
import { PlanView } from "@/components/PlanView";
import { CreatePlanModal } from "@/components/CreatePlanModal";
import type { Step } from "@/lib/db";

export default function App() {
  const {
    plans,
    loading,
    createPlan,
    toggleStep,
    updateStepText,
    addStep,
    resetPlan,
    deletePlan,
  } = usePlans();

  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;

  async function handleCreate(title: string, steps: Omit<Step, "planId">[]) {
    const newId = await createPlan(title, steps);
    setShowCreate(false);
    setActivePlanId(newId);
  }

  async function handleDelete(planId: string) {
    await deletePlan(planId);
    setActivePlanId(null);
  }

  return (
    <>
      {activePlan ? (
        <PlanView
          plan={activePlan}
          onBack={() => setActivePlanId(null)}
          onToggleStep={(stepId, completed) => toggleStep(stepId, completed)}
          onUpdateStepText={(stepId, text) => updateStepText(stepId, text)}
          onAddStep={(text, order) => addStep(activePlan.id, text, order)}
          onResetPlan={() => resetPlan(activePlan.id)}
          onDeletePlan={() => handleDelete(activePlan.id)}
        />
      ) : (
        <Dashboard
          plans={plans}
          loading={loading}
          onSelectPlan={setActivePlanId}
          onNewPlan={() => setShowCreate(true)}
        />
      )}

      {showCreate && (
        <CreatePlanModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
