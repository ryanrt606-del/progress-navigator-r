export function ProgressBar({ percent, className = "" }: { percent: number; className?: string }) {
  return (
    <div className={`h-2 w-full rounded-full bg-secondary overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500 gradient-brand"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
