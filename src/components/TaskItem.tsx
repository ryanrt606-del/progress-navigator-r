import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Pencil } from "lucide-react";
import type { Step } from "@/lib/db";

interface TaskItemProps {
  step: Step;
  idx: number;
  isEditing: boolean;
  editText: string;
  onToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
}

export function TaskItem({
  step,
  idx,
  isEditing,
  editText,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
}: TaskItemProps) {
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) editInputRef.current?.focus();
  }, [isEditing]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`
        flex items-start gap-3 rounded-2xl p-4 border transition-colors duration-200 tap-highlight-none
        ${isEditing
          ? "bg-card border-primary/50 shadow-[0_0_0_2px_hsl(20_100%_60%/0.12)]"
          : step.completed
            ? "bg-secondary/40 border-border/40"
            : "bg-card border-border hover:border-border/80"
        }
      `}
    >
      {/* Toggle checkbox */}
      <button
        onClick={onToggle}
        className="mt-0.5 shrink-0 tap-highlight-none"
        aria-label={step.completed ? "Mark incomplete" : "Mark complete"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {step.completed ? (
            <motion.div
              key="checked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <CheckCircle2 size={19} className="text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Circle size={19} className="text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Text / Edit input */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={editInputRef}
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); onSaveEdit(); }
              if (e.key === "Escape") { e.stopPropagation(); onCancelEdit(); }
            }}
            onBlur={onSaveEdit}
            className="w-full bg-transparent text-sm text-foreground outline-none border-none leading-snug caret-primary"
          />
        ) : (
          <button onClick={onToggle} className="w-full text-left text-sm leading-snug tap-highlight-none">
            <motion.span
              animate={{ opacity: step.completed ? 0.45 : 1 }}
              transition={{ duration: 0.2 }}
              className={step.completed ? "line-through text-muted-foreground" : "text-foreground"}
            >
              {step.text}
            </motion.span>
          </button>
        )}
      </div>

      {/* Edit + index */}
      <div className="shrink-0 flex items-center gap-2 mt-0.5">
        {!isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
            className="text-muted-foreground/20 hover:text-primary transition-colors p-0.5 rounded"
            aria-label="Edit task"
          >
            <Pencil size={12} />
          </button>
        )}
        <span className="text-[10px] text-muted-foreground/25 font-mono">#{idx + 1}</span>
      </div>
    </motion.div>
  );
}
