import { Trash2, X } from "lucide-react";

interface DeletePlanModalProps {
  planTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePlanModal({ planTitle, onConfirm, onCancel }: DeletePlanModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-[0_20px_60px_-10px_hsl(220_16%_4%/0.8)] animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Trash2 size={14} className="text-destructive" />
            </div>
            <h2 className="font-semibold text-foreground">Delete Plan</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-secondary"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{planTitle}"</span>? This action
            cannot be undone and all tasks will be permanently removed.
          </p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-border/80 bg-secondary hover:bg-secondary/80 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
