import { useState, useEffect, useRef } from "react";
import { Rocket, Plus, ChevronLeft, CheckCircle2, Circle, Trash2, RotateCcw, X, Sparkles, Calendar, ListChecks, TrendingUp, Pencil } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Step {
  id: string;
  text: string;
  completed: boolean;
}

interface Plan {
  id: string;
  title: string;
  steps: Step[];
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function parsePlanText(text: string): Step[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const steps: Step[] = [];

  for (const line of lines) {
    // Remove leading list markers: 1. 2) - • * ─
    const cleaned = line
      .replace(/^(\d+[\.\)]|[-•\*─])\s+/, "")
      .trim();
    if (cleaned.length > 0) {
      steps.push({ id: generateId(), text: cleaned, completed: false });
    }
  }

  return steps;
}

function getCompletion(plan: Plan) {
  if (plan.steps.length === 0) return 0;
  const done = plan.steps.filter((s) => s.completed).length;
  return Math.round((done / plan.steps.length) * 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function loadPlans(): Plan[] {
  try {
    return JSON.parse(localStorage.getItem("progress-tracker-plans") || "[]");
  } catch {
    return [];
  }
}

function savePlans(plans: Plan[]) {
  localStorage.setItem("progress-tracker-plans", JSON.stringify(plans));
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ percent, className = "" }: { percent: number; className?: string }) {
  return (
    <div className={`h-2 w-full rounded-full bg-secondary overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500 gradient-brand"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function PlanCard({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  const pct = getCompletion(plan);
  const done = plan.steps.filter((s) => s.completed).length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group rounded-2xl bg-card border border-border p-5 hover:border-primary/40 hover:shadow-[0_4px_24px_-4px_hsl(20_100%_60%/0.2)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-2">
          {plan.title}
        </h3>
        <span className="shrink-0 text-sm font-bold text-gradient">
          {pct}%
        </span>
      </div>

      <ProgressBar percent={pct} className="mb-3" />

      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <ListChecks size={13} />
        <span>
          {done} / {plan.steps.length} tasks
        </span>
        <span className="ml-auto opacity-60 flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(plan.createdAt)}
        </span>
      </div>
    </button>
  );
}

// ─── Create Plan Modal ────────────────────────────────────────────────────────

function CreatePlanModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (plan: Plan) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [planText, setPlanText] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (step === 1) nameRef.current?.focus();
    else textRef.current?.focus();
  }, [step]);

  function handleNext() {
    if (name.trim()) setStep(2);
  }

  function handleCreate() {
    const steps = parsePlanText(planText);
    const plan: Plan = {
      id: generateId(),
      title: name.trim(),
      steps,
      createdAt: new Date().toISOString(),
    };
    onCreate(plan);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-[0_20px_60px_-10px_hsl(220_16%_4%/0.8)] animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shadow-brand">
              <Sparkles size={14} className="text-white" />
            </div>
            <h2 className="font-semibold text-foreground">New Plan</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Step {step}/2
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-secondary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pb-5">
          <div className="flex gap-2 mb-5">
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? "gradient-brand" : "bg-border"}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? "gradient-brand" : "bg-border"}`} />
          </div>

          {step === 1 ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plan Name
              </label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                placeholder="e.g. Launch MVP in 30 days"
                className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Paste Your AI Plan
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Paste numbered steps or bullet points — each line becomes a task.
              </p>
              <textarea
                ref={textRef}
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                placeholder={`1. Research competitors\n2. Define MVP features\n3. Set up project repo\n- Design wireframes\n• Build landing page`}
                rows={8}
                className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-xs leading-relaxed"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                {parsePlanText(planText).length} tasks detected
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-border/80 bg-secondary hover:bg-secondary/80 transition-all"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white gradient-brand shadow-brand hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={parsePlanText(planText).length === 0}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white gradient-brand shadow-brand hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              Create Tracker
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Plan View ────────────────────────────────────────────────────────────────

function PlanView({
  plan,
  onBack,
  onUpdate,
  onDelete,
}: {
  plan: Plan;
  onBack: () => void;
  onUpdate: (plan: Plan) => void;
  onDelete: (id: string) => void;
}) {
  const pct = getCompletion(plan);
  const done = plan.steps.filter((s) => s.completed).length;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  function toggleStep(id: string) {
    onUpdate({
      ...plan,
      steps: plan.steps.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      ),
    });
  }

  function startEdit(step: Step) {
    setEditingId(step.id);
    setEditText(step.text);
  }

  function saveEdit(id: string) {
    const trimmed = editText.trim();
    if (trimmed) {
      onUpdate({
        ...plan,
        steps: plan.steps.map((s) => s.id === id ? { ...s, text: trimmed } : s),
      });
    }
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleReset() {
    onUpdate({ ...plan, steps: plan.steps.map((s) => ({ ...s, completed: false })) });
  }

  function handleDelete() {
    if (confirm(`Delete "${plan.title}"? This cannot be undone.`)) {
      onDelete(plan.id);
    }
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

        {/* Progress Hero Card */}
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

        {/* Action Buttons */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-card border border-border hover:border-border/80 hover:bg-secondary transition-all"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleDelete}
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

          {plan.steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => { if (editingId !== step.id) toggleStep(step.id); }}
              className={`
                w-full text-left flex items-start gap-3 rounded-2xl p-4 border transition-all duration-150 active:scale-[0.99]
                ${editingId === step.id
                  ? "bg-card border-primary/50 shadow-[0_0_0_2px_hsl(20_100%_60%/0.15)]"
                  : step.completed
                    ? "bg-secondary/60 border-border/50 opacity-70"
                    : "bg-card border-border hover:border-primary/30 hover:bg-secondary/50"
                }
              `}
            >
              {/* Checkbox icon */}
              <div className="mt-0.5 shrink-0">
                {step.completed ? (
                  <CheckCircle2 size={18} className="text-primary" />
                ) : (
                  <Circle size={18} className="text-muted-foreground/50" />
                )}
              </div>

              {/* Text / Edit input */}
              <div className="flex-1 min-w-0" onClick={(e) => editingId === step.id && e.stopPropagation()}>
                {editingId === step.id ? (
                  <input
                    ref={editInputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); saveEdit(step.id); }
                      if (e.key === "Escape") { e.stopPropagation(); cancelEdit(); }
                    }}
                    onBlur={() => saveEdit(step.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent text-sm text-foreground outline-none border-none leading-snug caret-primary"
                  />
                ) : (
                  <span className={`text-sm leading-snug ${step.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {step.text}
                  </span>
                )}
              </div>

              {/* Edit icon / task number */}
              <div className="shrink-0 flex items-center gap-2 mt-0.5">
                {editingId !== step.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(step); }}
                    className="text-muted-foreground/30 hover:text-primary transition-colors p-0.5 rounded"
                    aria-label="Edit task"
                  >
                    <Pencil size={13} />
                  </button>
                )}
                <span className="text-xs text-muted-foreground/30">#{idx + 1}</span>
              </div>
            </button>
          ))}

          {plan.steps.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No tasks in this plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({
  plans,
  onSelectPlan,
  onNewPlan,
}: {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  onNewPlan: () => void;
}) {
  const totalTasks = plans.reduce((acc, p) => acc + p.steps.length, 0);
  const completedTasks = plans.reduce(
    (acc, p) => acc + p.steps.filter((s) => s.completed).length,
    0
  );
  const activePlans = plans.filter((p) => getCompletion(p) < 100).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-brand">
              <Rocket size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-xl leading-tight">
                Progress Tracker
              </h1>
              <p className="text-xs text-muted-foreground">Stay on track, ship it.</p>
            </div>
          </div>
          <button
            onClick={onNewPlan}
            className="flex items-center gap-1.5 rounded-xl gradient-brand shadow-brand text-white text-sm font-semibold px-4 py-2.5 hover:opacity-90 active:scale-[0.97] transition-all"
          >
            <Plus size={15} />
            New Plan
          </button>
        </div>

        {/* Stats row */}
        {plans.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Rocket size={14} />, label: "Plans", value: plans.length },
              { icon: <TrendingUp size={14} />, label: "Active", value: activePlans },
              { icon: <CheckCircle2 size={14} />, label: "Tasks Done", value: completedTasks },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-card border border-border p-3.5 text-center"
              >
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  {stat.icon}
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Plans list */}
        {plans.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl gradient-brand mx-auto flex items-center justify-center shadow-brand mb-4">
              <Rocket size={28} className="text-white" />
            </div>
            <h2 className="text-foreground font-semibold text-lg mb-2">No plans yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Create your first plan by pasting an AI-generated list of steps.
            </p>
            <button
              onClick={onNewPlan}
              className="inline-flex items-center gap-2 rounded-xl gradient-brand shadow-brand text-white text-sm font-semibold px-5 py-3 hover:opacity-90 transition-all"
            >
              <Plus size={15} />
              Create First Plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
              <ListChecks size={14} />
              Your Plans ({plans.length})
            </h2>
            {plans
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((plan) => (
                <PlanCard key={plan.id} plan={plan} onClick={() => onSelectPlan(plan)} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [plans, setPlans] = useState<Plan[]>(loadPlans);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    savePlans(plans);
  }, [plans]);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;

  function handleCreate(plan: Plan) {
    setPlans((prev) => [...prev, plan]);
    setShowCreate(false);
    setActivePlanId(plan.id);
  }

  function handleUpdate(updated: Plan) {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleDelete(id: string) {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setActivePlanId(null);
  }

  return (
    <>
      {activePlan ? (
        <PlanView
          plan={activePlan}
          onBack={() => setActivePlanId(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ) : (
        <Dashboard
          plans={plans}
          onSelectPlan={(p) => setActivePlanId(p.id)}
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
