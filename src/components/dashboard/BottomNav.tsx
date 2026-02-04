import { createPortal } from "react-dom";
import { Home, LineChart, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTab = "home" | "grafieken" | "records" | "seizoenen";

const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "grafieken", label: "Grafieken", icon: LineChart },
  { id: "records", label: "Records", icon: Trophy },
  { id: "seizoenen", label: "Seizoenen", icon: Calendar },
];

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  className?: string;
}

export function BottomNav({ activeTab, onTabChange, className }: BottomNavProps) {
  const nav = (
    <nav
      role="tablist"
      aria-label="Hoofdnavigatie"
      className={cn("md:hidden ios-glass-nav", className)}
    >
      <div className="relative z-10 flex items-center justify-around h-16">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => onTabChange(id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-full",
                "touch-manipulation active:scale-95 transition-transform",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn("size-6 shrink-0", isActive && "stroke-[2.5]")}
                aria-hidden
              />
              <span className="text-[10px] font-medium truncate max-w-full px-1">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  return typeof document !== "undefined"
    ? createPortal(nav, document.body)
    : nav;
}
