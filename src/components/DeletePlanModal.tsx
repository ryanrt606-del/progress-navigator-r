import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertTriangle } from "lucide-react";

interface DeletePlanModalProps {
  planTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePlanModal({ planTitle, onConfirm, onCancel }: DeletePlanModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background/75 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative w-full max-w-sm rounded-3xl bg-card border border-border shadow-elevated overflow-hidden"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Danger accent line */}
        <div className="h-1 w-full bg-destructive/60" />

        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-destructive/15 flex items-center justify-center">
              <AlertTriangle size={15} className="text-destructive" />
            </div>
            <h2 className="font-bold text-foreground text-base">Delete Plan?</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1.5 hover:bg-secondary"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 pb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You're about to permanently delete{" "}
            <span className="font-semibold text-foreground">"{planTitle}"</span>.
            All tasks will be removed. This can't be undone.
          </p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="flex-1 rounded-2xl py-3 text-sm font-medium text-muted-foreground border border-border bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 transition-colors flex items-center justify-center gap-1.5 shadow-[0_4px_16px_-4px_hsl(0_72%_55%/0.5)]"
          >
            <Trash2 size={14} />
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
