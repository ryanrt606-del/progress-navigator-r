import { motion } from "framer-motion";
import { Home, LayoutList, BarChart2 } from "lucide-react";
import type { Tab } from "@/App";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "plans", label: "Plans", icon: LayoutList },
  { id: "stats", label: "Stats", icon: BarChart2 },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="relative z-30 pb-safe pt-2 px-4">
      {/* Frosted bar */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(222 20% 6% / 0.98), hsl(222 20% 6% / 0.85))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid hsl(var(--border) / 0.4)",
        }}
      />
      <div className="relative flex items-center justify-around max-w-xs mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => onTabChange(id)}
              whileTap={{ scale: 0.85 }}
              className="relative flex flex-col items-center gap-1 px-5 py-2 tap-highlight-none"
            >
              {/* Floating glowing pill */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, hsl(20 100% 60% / 0.15), hsl(330 90% 62% / 0.15))",
                    boxShadow: "0 0 16px hsl(20 100% 60% / 0.18), inset 0 0 0 1px hsl(20 100% 60% / 0.12)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <div className="relative flex flex-col items-center gap-1">
                <motion.div
                  animate={{
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    scale: isActive ? 1.12 : 1,
                    filter: isActive ? "drop-shadow(0 0 6px hsl(20 100% 60% / 0.55))" : "none",
                  }}
                  transition={{ duration: 0.22 }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                </motion.div>
                <motion.span
                  animate={{
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  className="text-[10px] leading-none"
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
