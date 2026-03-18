import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ListChecks, Search, X, SortAsc } from "lucide-react";
import { PlanCard } from "@/components/PlanCard";
import { getCompletion, type PlanWithSteps } from "@/hooks/usePlans";

interface PlansScreenProps {
  plans: PlanWithSteps[];
  loading: boolean;
  onSelectPlan: (id: string) => void;
  onNewPlan: () => void;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

type SortMode = "newest" | "oldest" | "progress";

export function PlansScreen({ plans, loading, onSelectPlan, onNewPlan }: PlansScreenProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [showSearch, setShowSearch] = useState(false);

  const filtered = plans
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return getCompletion(b.steps) - getCompletion(a.steps);
    });

  const completed = plans.filter((p) => getCompletion(p.steps) === 100).length;
  const active = plans.filter((p) => getCompletion(p.steps) < 100).length;

  const sortLabels: Record<SortMode, string> = {
    newest: "Newest",
    oldest: "Oldest",
    progress: "Progress",
  };

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="max-w-xl mx-auto px-4 pt-14 pb-6">

        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Plans</h1>
            {plans.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {active} active · {completed} completed
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSearch((v) => !v)}
              className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSearch ? <X size={15} /> : <Search size={15} />}
            </motion.button>
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

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-2xl bg-secondary border border-border px-4 py-3">
                <Search size={15} className="text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search plans…"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X size={13} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort tabs */}
        {plans.length > 1 && (
          <motion.div
            className="flex items-center gap-2 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <SortAsc size={13} className="text-muted-foreground shrink-0" />
            <div className="flex bg-secondary rounded-xl p-1 gap-0.5">
              {(["newest", "oldest", "progress"] as SortMode[]).map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setSort(s)}
                  whileTap={{ scale: 0.94 }}
                  className={`relative text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    sort === s ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {sort === s && (
                    <motion.div
                      layoutId="sort-pill"
                      className="absolute inset-0 bg-card rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{sortLabels[s]}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* List */}
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
        ) : filtered.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-3xl bg-secondary mx-auto flex items-center justify-center mb-4">
              <ListChecks size={26} className="text-muted-foreground/40" />
            </div>
            <p className="text-foreground font-semibold mb-1">
              {search ? "No plans found" : "No plans yet"}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? `Nothing matches "${search}"` : "Create your first plan to get started."}
            </p>
            {!search && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={onNewPlan}
                className="inline-flex items-center gap-2 rounded-2xl gradient-brand shadow-brand text-white text-sm font-semibold px-6 py-3"
              >
                <Plus size={15} />
                New Plan
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {filtered.map((plan) => (
              <motion.div key={plan.id} variants={fadeUp}>
                <PlanCard plan={plan} onClick={() => onSelectPlan(plan.id)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
