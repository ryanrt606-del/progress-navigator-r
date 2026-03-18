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
    <div className="relative z-30 bg-background/80 backdrop-blur-xl border-t border-border px-6 pb-safe pt-2">
      <div className="flex items-center justify-around max-w-xs mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => onTabChange(id)}
              whileTap={{ scale: 0.88 }}
              className="relative flex flex-col items-center gap-1 px-5 py-2 tap-highlight-none"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl gradient-brand-soft"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative flex flex-col items-center gap-1">
                <motion.div
                  animate={{
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
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
