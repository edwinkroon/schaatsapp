import { createPortal } from "react-dom";
import { LayoutDashboard, TrendingUp, Medal, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTab = "home" | "grafieken" | "records" | "seizoenen";

const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "grafieken", label: "Grafieken", icon: TrendingUp },
  { id: "records", label: "Records", icon: Medal },
  { id: "seizoenen", label: "Seizoenen", icon: CalendarDays },
];

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  className?: string;
}

export function BottomNav({ activeTab, onTabChange, className }: BottomNavProps) {
  const nav = (
    <div className={cn("ios-glass-nav-wrapper md:hidden", className)}>
      <div className="ios-glass-nav-blur" aria-hidden />
      <nav
        role="tablist"
        aria-label="Hoofdnavigatie"
        className="ios-glass-nav flex flex-col"
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
                  ? "text-primary font-semibold"
                  : "text-foreground/65 hover:text-foreground"
              )}
            >
              <Icon
                className={cn("size-5 shrink-0", isActive && "stroke-[2.5]")}
                strokeWidth={1.75}
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
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(nav, document.body)
    : nav;
}
