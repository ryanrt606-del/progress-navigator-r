import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Plus, RotateCcw, Trash2, Sparkles, Calendar, ListChecks,
} from "lucide-react";
import { TaskItem } from "@/components/TaskItem";
import { ProgressBar } from "@/components/ProgressBar";
import { DeletePlanModal } from "@/components/DeletePlanModal";
import { getCompletion, formatDate, type PlanWithSteps } from "@/hooks/usePlans";

interface PlanViewProps {
  plan: PlanWithSteps;
  onBack: () => void;
  onToggleStep: (stepId: string, completed: boolean) => void;
  onUpdateStepText: (stepId: string, text: string) => void;
  onAddStep: (text: string, order: number) => void;
  onResetPlan: () => void;
  onDeletePlan: () => void;
}

export function PlanView({
  plan,
  onBack,
  onToggleStep,
  onUpdateStepText,
  onAddStep,
  onResetPlan,
  onDeletePlan,
}: PlanViewProps) {
  const pct = getCompletion(plan.steps);
  const done = plan.steps.filter((s) => s.completed).length;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingTask) addInputRef.current?.focus();
  }, [addingTask]);

  function handleAddTask() {
    const trimmed = newTaskText.trim();
    if (trimmed) onAddStep(trimmed, plan.steps.length);
    setNewTaskText("");
    setAddingTask(false);
  }

  function startEdit(id: string, text: string) {
    setEditingId(id);
    setEditText(text);
  }

  function saveEdit(stepId: string) {
    const trimmed = editText.trim();
    if (trimmed) onUpdateStepText(stepId, trimmed);
    setEditingId(null);
  }

  return (
    <motion.div
      className="min-h-screen bg-background tap-highlight-none"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-xl mx-auto px-4 py-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={onBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium bg-secondary border border-border rounded-xl px-3 py-2 shrink-0"
          >
            <ChevronLeft size={15} />
            Back
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground text-lg truncate">{plan.title}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar size={10} />
              Created {formatDate(plan.createdAt)}
            </p>
          </div>
        </div>

        {/* Progress Hero */}
        <motion.div
          className="rounded-3xl gradient-hero p-6 mb-5 shadow-brand relative overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-10 -translate-x-8" />
          <div className="absolute top-1/2 right-8 w-16 h-16 bg-white/5 rounded-full -translate-y-1/2" />
          <div className="relative">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">Completion</p>
                <motion.p
                  className="text-white text-5xl font-black tracking-tight leading-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  {pct}%
                </motion.p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-1 uppercase tracking-wider">Tasks</p>
                <p className="text-white text-2xl font-bold leading-none">
                  {done}
                  <span className="text-white/50 text-base font-normal"> / {plan.steps.length}</span>
                </p>
              </div>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <AnimatePresence>
              {pct === 100 && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-3 text-white/90 text-sm font-semibold flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  All tasks complete — great work!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onResetPlan}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-muted-foreground hover:text-foreground card-glass hover:border-border/60 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-destructive card-glass hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
          >
            <Trash2 size={14} />
            Delete Plan
          </motion.button>
        </div>

        {/* Task List */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
            <ListChecks size={13} />
            Tasks ({plan.steps.length})
          </h2>

          <div className="space-y-2.5">
            {plan.steps.map((step, idx) => (
              <TaskItem
                key={step.id}
                step={step}
                idx={idx}
                isEditing={editingId === step.id}
                editText={editText}
                onToggle={() => { if (editingId !== step.id) onToggleStep(step.id, !step.completed); }}
                onStartEdit={() => startEdit(step.id, step.text)}
                onSaveEdit={() => saveEdit(step.id)}
                onCancelEdit={() => setEditingId(null)}
                onEditTextChange={setEditText}
              />
            ))}
          </div>

          {plan.steps.length === 0 && !addingTask && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No tasks yet. Add your first task below.
            </div>
          )}

          <div className="mt-3">
            <AnimatePresence mode="wait">
              {addingTask ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 rounded-2xl p-4 border border-primary/50 bg-card shadow-[0_0_0_2px_hsl(20_100%_60%/0.12)]"
                >
                  <Plus size={17} className="text-primary shrink-0" />
                  <input
                    ref={addInputRef}
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddTask(); }
                      if (e.key === "Escape") { setAddingTask(false); setNewTaskText(""); }
                    }}
                    onBlur={handleAddTask}
                    placeholder="Type new task…"
                    className="flex-1 bg-transparent text-sm text-foreground outline-none border-none leading-snug caret-primary placeholder:text-muted-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground/40">Enter ↵</span>
                </motion.div>
              ) : (
                <motion.button
                  key="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setAddingTask(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/40 hover:bg-secondary/40 transition-colors"
                >
                  <Plus size={15} />
                  Add Task
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <DeletePlanModal
            planTitle={plan.title}
            onConfirm={() => { setShowDeleteModal(false); onDeletePlan(); }}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
