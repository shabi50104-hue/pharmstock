import {
  Bell,
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings,
} from "lucide-react";
import type { TabRoute } from "../types";

interface BottomNavProps {
  active: TabRoute;
  onNavigate: (tab: TabRoute) => void;
  alertCount?: number;
}

const tabs: {
  id: TabRoute;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "add", label: "Add Drug", icon: PlusCircle },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function BottomNav({
  active,
  onNavigate,
  alertCount = 0,
}: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb"
      data-ocid="bottom-nav"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const showBadge = tab.id === "alerts" && alertCount > 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              data-ocid={`nav-${tab.id}`}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-1 min-h-[56px]
                transition-colors duration-200 relative focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
                ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}
              `}
            >
              <span className="relative">
                <Icon size={22} className={isActive ? "text-primary" : ""} />
                {showBadge && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse-alert"
                    aria-label={`${alertCount} alerts`}
                  >
                    {alertCount > 99 ? "99+" : alertCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-medium leading-none ${isActive ? "text-primary font-semibold" : ""}`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
