import { useState, useEffect, useRef } from "react";
import { Sparkles, X } from "lucide-react";
import { parsePlanText, type PlanWithSteps } from "@/hooks/usePlans";
import type { Step } from "@/lib/db";

interface CreatePlanModalProps {
  onClose: () => void;
  onCreate: (title: string, steps: Omit<Step, "planId">[]) => void;
}

export function CreatePlanModal({ onClose, onCreate }: CreatePlanModalProps) {
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
    onCreate(name.trim(), steps);
  }

  const detectedCount = parsePlanText(planText).length;

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
              <label className="block text-sm font-medium text-foreground mb-2">Plan Name</label>
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
              <label className="block text-sm font-medium text-foreground mb-1">Paste Your AI Plan</label>
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
              <p className="text-xs text-muted-foreground mt-1.5">{detectedCount} tasks detected</p>
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
              disabled={detectedCount === 0}
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
