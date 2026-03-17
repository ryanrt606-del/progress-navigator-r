import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight } from "lucide-react";
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
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background/75 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-elevated overflow-hidden"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top gradient accent line */}
        <div className="h-1 w-full gradient-brand" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand-sm">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base">New Plan</h2>
              <p className="text-xs text-muted-foreground">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-xl p-1.5 hover:bg-secondary"
          >
            <X size={15} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pb-5">
          <div className="flex gap-2 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-400 ${
                  step >= s ? "gradient-brand" : "bg-border"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Plan Name
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder="e.g. Launch MVP in 30 days"
                  className="w-full rounded-2xl bg-secondary border border-border px-4 py-3.5 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Paste Your Plan
                </label>
                <p className="text-xs text-muted-foreground mb-2.5">
                  Each line becomes a task. Use numbers, bullets, or dashes.
                </p>
                <textarea
                  ref={textRef}
                  value={planText}
                  onChange={(e) => setPlanText(e.target.value)}
                  placeholder={`1. Research competitors\n2. Define MVP features\n3. Set up project repo\n- Design wireframes\n• Build landing page`}
                  rows={8}
                  className="w-full rounded-2xl bg-secondary border border-border px-4 py-3.5 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all resize-none font-mono text-xs leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {detectedCount > 0 ? (
                      <span className="text-primary font-medium">{detectedCount} tasks detected</span>
                    ) : (
                      "Start typing to detect tasks"
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 rounded-2xl py-3 text-sm font-medium text-muted-foreground border border-border bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </motion.button>
          {step === 1 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!name.trim()}
              className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white gradient-brand shadow-brand hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-1.5"
            >
              Next
              <ArrowRight size={14} />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              disabled={detectedCount === 0}
              className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white gradient-brand shadow-brand hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              Create Plan
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
