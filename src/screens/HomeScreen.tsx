import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, Plus, CheckCircle2, Zap, TrendingUp, ArrowRight, Download,
  Flame, Target, Calendar,
} from "lucide-react";
import { getCompletion, formatDate, type PlanWithSteps } from "@/hooks/usePlans";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { PlanCard } from "@/components/PlanCard";

interface HomeScreenProps {
  plans: PlanWithSteps[];
  loading: boolean;
  onSelectPlan: (id: string) => void;
  onNewPlan: () => void;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function HomeScreen({ plans, loading, onSelectPlan, onNewPlan }: HomeScreenProps) {
  const { isInstallable, install } = usePWAInstall();
  const totalTasks = plans.reduce((acc, p) => acc + p.steps.length, 0);
  const completedTasks = plans.reduce((acc, p) => acc + p.steps.filter((s) => s.completed).length, 0);
  const activePlans = plans.filter((p) => getCompletion(p.steps) < 100);
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const recentPlans = [...plans]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="max-w-xl mx-auto px-4 pt-14 pb-6">

        {/* ── Header ── */}
        <motion.div
          className="flex items-start justify-between mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-0.5">{greeting} 👋</p>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Progress
              <span className="text-gradient"> Navigator</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {isInstallable && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={install}
                className="flex items-center gap-1.5 rounded-xl bg-secondary border border-border text-muted-foreground text-xs font-medium px-3 py-2"
              >
                <Download size={13} />
                Install
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={onNewPlan}
              className="flex items-center gap-1.5 rounded-xl gradient-brand shadow-brand text-white text-sm font-semibold px-4 py-2"
            >
              <Plus size={15} />
              New
            </motion.button>
          </div>
        </motion.div>

        {/* ── Hero progress card ── */}
        {plans.length > 0 && totalTasks > 0 && (
          <motion.div
            className="rounded-3xl gradient-hero p-6 mb-6 shadow-brand relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-12 -translate-x-10" />
            <div className="relative">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
                Overall Progress
              </p>
              <div className="flex items-end justify-between mb-4">
                <motion.p
                  className="text-white text-6xl font-black tracking-tight leading-none"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  {overallPct}%
                </motion.p>
                <div className="text-right">
                  <p className="text-white/50 text-xs mb-0.5">Tasks done</p>
                  <p className="text-white text-2xl font-bold leading-none">
                    {completedTasks}
                    <span className="text-white/40 text-base font-normal"> / {totalTasks}</span>
                  </p>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-white/70 text-xs">
                <Target size={11} />
                <span>{activePlans.length} active plan{activePlans.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Quick stats row ── */}
        <AnimatePresence>
          {plans.length > 0 && (
            <motion.div
              className="grid grid-cols-3 gap-3 mb-6"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {[
                { icon: <Rocket size={16} />, label: "Plans", value: plans.length, color: "text-primary" },
                { icon: <Zap size={16} />, label: "Active", value: activePlans.length, color: "text-primary" },
                { icon: <CheckCircle2 size={16} />, label: "Done", value: completedTasks, color: "text-primary" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="rounded-2xl card-glass p-4 text-center"
                >
                  <div className={`flex justify-center mb-2 ${stat.color}`}>{stat.icon}</div>
                  <p className="text-2xl font-extrabold text-foreground leading-none mb-1">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Recent plans ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
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
              Create your first plan and start tracking progress.
            </p>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onNewPlan}
              className="inline-flex items-center gap-2 rounded-2xl gradient-brand shadow-brand text-white text-sm font-semibold px-6 py-3.5"
            >
              <Plus size={16} />
              Create First Plan
            </motion.button>
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Flame size={13} className="text-primary" />
                Recent Plans
              </h2>
            </motion.div>
            <div className="space-y-3">
              {recentPlans.map((plan) => (
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
