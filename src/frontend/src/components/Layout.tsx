import { Button } from "@/components/ui/button";
import { LogOut, Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { TabRoute } from "../types";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabRoute;
  onNavigate: (tab: TabRoute) => void;
  alertCount?: number;
  onSearchClick?: () => void;
}

export function Layout({
  children,
  activeTab,
  onNavigate,
  alertCount = 0,
  onSearchClick,
}: LayoutProps) {
  const { initials, shortPrincipal } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-elevated">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary-foreground/20 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="1"
                  y="3"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 8h6M8 5v6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Pharma<span className="font-light opacity-80">Stock</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSearchClick && (
              <button
                type="button"
                onClick={onSearchClick}
                data-ocid="header-search"
                aria-label="Search drugs"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
              >
                <Search size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate("settings")}
              data-ocid="header-avatar"
              aria-label={`User: ${shortPrincipal ?? "unknown"}`}
              className="relative w-9 h-9 rounded-full bg-primary-foreground/25 hover:bg-primary-foreground/35 transition-colors flex items-center justify-center font-display font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
            >
              {initials}
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full pb-[72px]">
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav
        active={activeTab}
        onNavigate={onNavigate}
        alertCount={alertCount}
      />
    </div>
  );
}

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const { logout, shortPrincipal } = useAuth();
  return (
    <div
      className={`flex items-center justify-between p-4 bg-card rounded-lg border border-border ${className ?? ""}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">Logged in as</p>
        <p className="text-xs text-muted-foreground truncate font-mono">
          {shortPrincipal ?? "—"}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        data-ocid="logout-btn"
        className="flex items-center gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 flex-shrink-0 ml-3"
      >
        <LogOut size={14} />
        Logout
      </Button>
    </div>
  );
}
