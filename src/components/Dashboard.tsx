import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Plus, CheckCircle2, TrendingUp, Download, ListChecks, Zap } from "lucide-react";
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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export function Dashboard({ plans, loading, onSelectPlan, onNewPlan }: DashboardProps) {
  const { isInstallable, install } = usePWAInstall();
  const totalTasks = plans.reduce((acc, p) => acc + p.steps.length, 0);
  const completedTasks = plans.reduce((acc, p) => acc + p.steps.filter((s) => s.completed).length, 0);
  const activePlans = plans.filter((p) => getCompletion(p.steps) < 100).length;
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const sorted = [...plans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background tap-highlight-none">
      <div className="max-w-xl mx-auto px-4 py-6 pb-16">

        {/* ── Header ── */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center shadow-brand">
              <Rocket size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-foreground text-xl leading-tight tracking-tight">
                Progress
                <span className="text-gradient"> Navigator</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Track what matters most</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isInstallable && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={install}
                title="Install app"
                className="flex items-center gap-1.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 hover:bg-secondary/80 transition-colors"
              >
                <Download size={13} />
                <span className="hidden sm:inline text-xs">Install</span>
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onNewPlan}
              className="flex items-center gap-1.5 rounded-xl gradient-brand shadow-brand text-white text-sm font-semibold px-4 py-2 hover:opacity-90 transition-opacity"
            >
              <Plus size={15} />
              New Plan
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <AnimatePresence>
          {plans.length > 0 && (
            <motion.div
              className="grid grid-cols-3 gap-3 mb-6"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {[
                { icon: <Rocket size={14} />, label: "Plans", value: plans.length },
                { icon: <Zap size={14} />, label: "Active", value: activePlans },
                { icon: <CheckCircle2 size={14} />, label: "Done", value: completedTasks },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="rounded-2xl card-glass p-4 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 gradient-brand-soft opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-2">
                      <span className="text-primary">{stat.icon}</span>
                      <span className="text-xs font-medium">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overall progress strip */}
        {plans.length > 0 && totalTasks > 0 && (
          <motion.div
            className="rounded-2xl card-glass p-4 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-foreground">Overall Progress</span>
              <span className="text-sm font-bold text-gradient">{overallPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-brand"
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {completedTasks} of {totalTasks} tasks completed across all plans
            </p>
          </motion.div>
        )}

        {/* ── Progress Timeline ── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProgressTimeline />
        </motion.div>

        {/* ── Year Progress Map ── */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <YearProgressMap />
        </motion.div>

        {/* ── Plans list ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl card-glass p-5 overflow-hidden relative">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="h-4 bg-secondary rounded-full w-3/4 mb-3" />
                <div className="h-2 bg-secondary rounded-full mb-3" />
                <div className="h-3 bg-secondary rounded-full w-1/3" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-20 h-20 rounded-3xl gradient-brand mx-auto flex items-center justify-center shadow-brand mb-5">
              <Rocket size={32} className="text-white" />
            </div>
            <h2 className="text-foreground font-bold text-xl mb-2">No plans yet</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              Create your first plan by pasting an AI-generated list of steps.
            </p>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onNewPlan}
              className="inline-flex items-center gap-2 rounded-2xl gradient-brand shadow-brand text-white text-sm font-semibold px-6 py-3.5 hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Create First Plan
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.h2
              variants={fadeUp}
              className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4"
            >
              <ListChecks size={13} />
              Your Plans ({plans.length})
            </motion.h2>
            <div className="space-y-3">
              {sorted.map((plan) => (
                <motion.div key={plan.id} variants={fadeUp}>
                  <PlanCard plan={plan} onClick={() => onSelectPlan(plan.id)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
