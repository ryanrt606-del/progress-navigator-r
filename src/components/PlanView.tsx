import { useState, useRef, useEffect } from "react";
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
    if (trimmed) {
      onAddStep(trimmed, plan.steps.length);
    }
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
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium bg-secondary hover:bg-secondary/80 border border-border rounded-xl px-3 py-2"
          >
            <ChevronLeft size={15} />
            Back
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground text-lg truncate">{plan.title}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar size={11} />
              Created {formatDate(plan.createdAt)}
            </p>
          </div>
        </div>

        {/* Progress Hero */}
        <div className="rounded-2xl gradient-hero p-6 mb-5 shadow-brand relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-6" />
          <div className="relative">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm font-medium mb-0.5">Progress</p>
                <p className="text-white text-5xl font-bold tracking-tight">{pct}%</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs mb-0.5">Completed</p>
                <p className="text-white text-2xl font-bold">
                  {done}
                  <span className="text-white/60 text-base font-normal"> / {plan.steps.length}</span>
                </p>
              </div>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            {pct === 100 && (
              <p className="mt-3 text-white/90 text-sm font-medium flex items-center gap-1.5">
                <Sparkles size={14} />
                All tasks complete — great work!
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={onResetPlan}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-card border border-border hover:border-border/80 hover:bg-secondary transition-all"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-destructive hover:text-destructive bg-card border border-border hover:border-destructive/40 hover:bg-destructive/10 transition-all"
          >
            <Trash2 size={14} />
            Delete Plan
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <ListChecks size={14} />
            Tasks ({plan.steps.length})
          </h2>

          <div className="space-y-2">
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
            <div className="text-center py-10 text-muted-foreground text-sm">
              No tasks yet. Add your first task below.
            </div>
          )}

          {addingTask ? (
            <div className="flex items-center gap-3 rounded-2xl p-4 border border-primary/50 bg-card shadow-[0_0_0_2px_hsl(20_100%_60%/0.15)]">
              <Plus size={18} className="text-primary shrink-0" />
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
              <span className="text-xs text-muted-foreground/40">Enter to add</span>
            </div>
          ) : (
            <button
              onClick={() => setAddingTask(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/40 hover:bg-secondary/50 transition-all"
            >
              <Plus size={15} />
              Add Task
            </button>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeletePlanModal
          planTitle={plan.title}
          onConfirm={() => { setShowDeleteModal(false); onDeletePlan(); }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
