import { motion } from "framer-motion";

interface ProgressBarProps {
  percent: number;
  className?: string;
  height?: "sm" | "md" | "lg";
}

export function ProgressBar({ percent, className = "", height = "sm" }: ProgressBarProps) {
  const hMap = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  return (
    <div className={`w-full rounded-full bg-secondary overflow-hidden ${hMap[height]} ${className}`}>
      <motion.div
        className="h-full rounded-full gradient-brand"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
