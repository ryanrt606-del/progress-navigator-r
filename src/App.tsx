import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlans } from "@/hooks/usePlans";
import { HomeScreen } from "@/screens/HomeScreen";
import { PlansScreen } from "@/screens/PlansScreen";
import { StatsScreen } from "@/screens/StatsScreen";
import { PlanView } from "@/components/PlanView";
import { CreatePlanModal } from "@/components/CreatePlanModal";
import { BottomNav } from "@/components/BottomNav";
import type { Step } from "@/lib/db";

export type Tab = "home" | "plans" | "stats";

const screenVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

const TAB_ORDER: Tab[] = ["home", "plans", "stats"];

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

  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [prevTab, setPrevTab] = useState<Tab>("home");
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;

  const direction =
    TAB_ORDER.indexOf(activeTab) - TAB_ORDER.indexOf(prevTab);

  function handleTabChange(tab: Tab) {
    if (tab === activeTab) return;
    setPrevTab(activeTab);
    setActiveTab(tab);
  }

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
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden tap-highlight-none">
      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {activePlan ? (
            <motion.div
              key="plan-view"
              className="absolute inset-0"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <PlanView
                plan={activePlan}
                onBack={() => setActivePlanId(null)}
                onToggleStep={(stepId, completed) => toggleStep(stepId, completed)}
                onUpdateStepText={(stepId, text) => updateStepText(stepId, text)}
                onAddStep={(text, order) => addStep(activePlan.id, text, order)}
                onResetPlan={() => resetPlan(activePlan.id)}
                onDeletePlan={() => handleDelete(activePlan.id)}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              className="absolute inset-0"
              custom={direction}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === "home" && (
                <HomeScreen
                  plans={plans}
                  loading={loading}
                  onSelectPlan={setActivePlanId}
                  onNewPlan={() => setShowCreate(true)}
                />
              )}
              {activeTab === "plans" && (
                <PlansScreen
                  plans={plans}
                  loading={loading}
                  onSelectPlan={setActivePlanId}
                  onNewPlan={() => setShowCreate(true)}
                />
              )}
              {activeTab === "stats" && <StatsScreen />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Nav — hidden when viewing a plan */}
      <AnimatePresence>
        {!activePlan && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreate && (
          <CreatePlanModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
