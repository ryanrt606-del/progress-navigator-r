import { useRef, useEffect } from "react";
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
    <div
      className={`
        flex items-start gap-3 rounded-2xl p-4 border transition-all duration-150
        ${isEditing
          ? "bg-card border-primary/50 shadow-[0_0_0_2px_hsl(20_100%_60%/0.15)]"
          : step.completed
            ? "bg-secondary/60 border-border/50 opacity-70"
            : "bg-card border-border"
        }
      `}
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        className="mt-0.5 shrink-0 transition-transform active:scale-90"
        aria-label={step.completed ? "Mark incomplete" : "Mark complete"}
      >
        {step.completed ? (
          <CheckCircle2 size={18} className="text-primary" />
        ) : (
          <Circle size={18} className="text-muted-foreground/50" />
        )}
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
          <button onClick={onToggle} className="w-full text-left text-sm leading-snug">
            <span className={step.completed ? "line-through text-muted-foreground" : "text-foreground"}>
              {step.text}
            </span>
          </button>
        )}
      </div>

      {/* Edit + index */}
      <div className="shrink-0 flex items-center gap-2 mt-0.5">
        {!isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
            className="text-muted-foreground/30 hover:text-primary transition-colors p-0.5 rounded"
            aria-label="Edit task"
          >
            <Pencil size={13} />
          </button>
        )}
        <span className="text-xs text-muted-foreground/30">#{idx + 1}</span>
      </div>
    </div>
  );
}
