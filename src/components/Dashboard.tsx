import { Rocket, Plus, CheckCircle2, ListChecks, TrendingUp, Download } from "lucide-react";
import { PlanCard } from "@/components/PlanCard";
import { getCompletion, type PlanWithSteps } from "@/hooks/usePlans";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { YearProgressMap } from "@/components/YearProgressMap";

interface DashboardProps {
  plans: PlanWithSteps[];
  loading: boolean;
  onSelectPlan: (id: string) => void;
  onNewPlan: () => void;
}

export function Dashboard({ plans, loading, onSelectPlan, onNewPlan }: DashboardProps) {
  const { isInstallable, install } = usePWAInstall();
  const totalTasks = plans.reduce((acc, p) => acc + p.steps.length, 0);
  const completedTasks = plans.reduce((acc, p) => acc + p.steps.filter((s) => s.completed).length, 0);
  const activePlans = plans.filter((p) => getCompletion(p.steps) < 100).length;

  const sorted = [...plans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
              <h1 className="font-bold text-foreground text-xl leading-tight">Progress Tracker</h1>
              <p className="text-xs text-muted-foreground">Stay on track, ship it.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isInstallable && (
              <button
                onClick={install}
                title="Install app"
                className="flex items-center gap-1.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2.5 hover:bg-secondary/80 transition-all"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}
            <button
              onClick={onNewPlan}
              className="flex items-center gap-1.5 rounded-xl gradient-brand shadow-brand text-white text-sm font-semibold px-4 py-2.5 hover:opacity-90 active:scale-[0.97] transition-all"
            >
              <Plus size={15} />
              New Plan
            </button>
          </div>
        </div>

        {/* Stats */}
        {plans.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Rocket size={14} />, label: "Plans", value: plans.length },
              { icon: <TrendingUp size={14} />, label: "Active", value: activePlans },
              { icon: <CheckCircle2 size={14} />, label: "Tasks Done", value: completedTasks },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-card border border-border p-3.5 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  {stat.icon}
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Progress Timeline ────────────────────────────────────────────── */}
        <div className="mb-4">
          <ProgressTimeline />
        </div>

        {/* ── Year Progress Heatmap ────────────────────────────────────────── */}
        <div className="mb-6">
          <YearProgressMap />
        </div>

        {/* Plans list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-5 animate-pulse">
                <div className="h-4 bg-secondary rounded-full w-3/4 mb-3" />
                <div className="h-2 bg-secondary rounded-full mb-3" />
                <div className="h-3 bg-secondary rounded-full w-1/3" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
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
            {sorted.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onClick={() => onSelectPlan(plan.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
