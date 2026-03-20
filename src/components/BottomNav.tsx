import { motion } from "framer-motion";
import { Home, LayoutList, BarChart2 } from "lucide-react";
import type { Tab } from "@/App";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "home",  label: "Home",  icon: Home },
  { id: "plans", label: "Plans", icon: LayoutList },
  { id: "stats", label: "Stats", icon: BarChart2 },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="relative z-30 pb-safe pt-1.5 px-4">
      {/* Frosted backing */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(222 20% 6% / 0.98) 60%, hsl(222 20% 6% / 0.82))",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderTop: "1px solid hsl(var(--border) / 0.35)",
        }}
      />

      <div className="relative flex items-center justify-around max-w-xs mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => onTabChange(id)}
              whileTap={{ scale: 0.82 }}
              className="relative flex flex-col items-center gap-1 px-6 py-2 tap-highlight-none"
            >
              {/* Floating glow pill */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, hsl(20 100% 60% / 0.14), hsl(330 90% 62% / 0.14))",
                    boxShadow: "0 0 14px hsl(20 100% 60% / 0.14), inset 0 0 0 1px hsl(20 100% 60% / 0.10)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative flex flex-col items-center gap-1">
                <motion.div
                  animate={{
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    scale: isActive ? 1.1 : 1,
                    filter: isActive
                      ? "drop-shadow(0 0 5px hsl(20 100% 60% / 0.5))"
                      : "none",
                  }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
                </motion.div>
                <motion.span
                  animate={{
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-[10px] leading-none font-medium"
                >
                  {label}
                </motion.span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
