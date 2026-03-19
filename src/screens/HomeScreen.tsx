import { motion, AnimatePresence } from "framer-motion";
import { Plus, Rocket, Zap, CheckCircle2, Target, Download } from "lucide-react";
import { getCompletion, formatDate, type PlanWithSteps } from "@/hooks/usePlans";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { PlanCard } from "@/components/PlanCard";

interface HomeScreenProps {
  plans: PlanWithSteps[];
  loading: boolean;
  onSelectPlan: (id: string) => void;
  onNewPlan: () => void;
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const } },
};

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {value}
    </motion.span>
  );
}

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
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="max-w-xl mx-auto px-4 pt-14 pb-6 space-y-8">

        {/* ── Header ── */}
        <motion.div
          className="flex items-start justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="text-muted-foreground text-xs font-medium mb-0.5 tracking-wide">{greeting} 👋</p>
            <h1 className="text-[1.6rem] font-extrabold tracking-tight leading-tight">
              Progress
              <span className="text-gradient"> Navigator</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {isInstallable && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={install}
                className="flex items-center gap-1.5 rounded-xl bg-secondary text-muted-foreground text-xs font-medium px-3 py-2 tap-highlight-none"
              >
                <Download size={12} />
                Install
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onNewPlan}
              className="flex items-center gap-1.5 rounded-xl gradient-brand shadow-brand text-white text-sm font-semibold px-4 py-2 tap-highlight-none"
            >
              <Plus size={15} />
              New
            </motion.button>
          </div>
        </motion.div>

        {/* ── Compact Hero Progress ── */}
        {plans.length > 0 && totalTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Ambient glow behind percentage */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, hsl(20 100% 60% / 0.13) 0%, transparent 70%)",
                filter: "blur(24px)",
              }}
            />

            <div className="relative flex items-end gap-6">
              {/* Giant percentage */}
              <div>
                <p className="text-[4.5rem] font-black leading-none tracking-tighter text-gradient tabular-nums">
                  <AnimatedNumber value={overallPct} />
                  <span className="text-2xl text-muted-foreground/60 font-bold">%</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Overall completion</p>
              </div>

              {/* Right stats */}
              <div className="pb-3 flex flex-col gap-1.5 text-right ml-auto">
                <div>
                  <p className="text-lg font-extrabold text-foreground leading-none tabular-nums">
                    {completedTasks}
                    <span className="text-muted-foreground/40 text-sm font-normal"> / {totalTasks}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">tasks done</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-foreground leading-none tabular-nums">{activePlans.length}</p>
                  <p className="text-[11px] text-muted-foreground">active plans</p>
                </div>
              </div>
            </div>

            {/* Thin animated progress bar */}
            <div className="mt-4 h-1 w-full rounded-full bg-secondary/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gradient-brand)" }}
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Glow dot at progress position */}
            {overallPct > 0 && (
              <motion.div
                className="absolute top-[calc(100%-2px)] w-2 h-2 rounded-full -translate-y-1/2"
                style={{
                  background: "hsl(20 100% 60%)",
                  boxShadow: "0 0 8px 3px hsl(20 100% 60% / 0.5)",
                }}
                initial={{ left: 0, opacity: 0 }}
                animate={{ left: `${Math.min(overallPct, 97)}%`, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </motion.div>
        )}

        {/* ── Inline stats row ── */}
        <AnimatePresence>
          {plans.length > 0 && (
            <motion.div
              className="flex items-center gap-0"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {[
                { icon: <Rocket size={15} />, label: "Plans", value: plans.length },
                { icon: <Zap size={15} />, label: "Active", value: activePlans.length },
                { icon: <CheckCircle2 size={15} />, label: "Done", value: completedTasks },
                { icon: <Target size={15} />, label: "Tasks", value: totalTasks },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="flex-1 flex flex-col items-center gap-1 py-3 relative"
                >
                  {/* vertical divider except first */}
                  {i > 0 && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-border/60" />
                  )}
                  <div className="text-primary/80">{stat.icon}</div>
                  <p className="text-xl font-extrabold text-foreground leading-none tabular-nums">
                    <AnimatedNumber value={stat.value} />
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Recent Plans ── */}
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl surface p-5 overflow-hidden relative h-20 animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glowing rocket icon */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div
                className="absolute inset-0 rounded-3xl"
                style={{ background: "var(--gradient-brand)", opacity: 0.15, filter: "blur(16px)" }}
              />
              <div className="relative w-20 h-20 rounded-3xl gradient-brand flex items-center justify-center shadow-brand">
                <Rocket size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-foreground font-bold text-xl mb-2">No plans yet</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              Create your first plan and start tracking progress.
            </p>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onNewPlan}
              className="inline-flex items-center gap-2 rounded-2xl gradient-brand shadow-brand text-white text-sm font-semibold px-6 py-3.5 tap-highlight-none"
            >
              <Plus size={16} />
              Create First Plan
            </motion.button>
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p
              variants={fadeUp}
              className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4"
            >
              Recent Plans
            </motion.p>
            <div className="space-y-2.5">
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
