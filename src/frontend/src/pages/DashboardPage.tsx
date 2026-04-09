import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Clock,
  FileText,
  ImageIcon,
  LayoutDashboard,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  useDashboardStats,
  useExpiryAlerts,
  useListBills,
} from "../hooks/useInventory";
import type { Bill, ExpiryAlert, TabRoute } from "../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function msFromNano(nano: bigint): number {
  return Number(nano) / 1_000_000;
}

function daysUntilExpiry(expiryNano: bigint): number {
  return Math.round(
    (msFromNano(expiryNano) - Date.now()) / (24 * 60 * 60 * 1000),
  );
}

function formatDate(nano: bigint): string {
  return new Date(msFromNano(nano)).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTime(nano: bigint): string {
  const diff = Date.now() - msFromNano(nano);
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(nano);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  variant?: "default" | "warning" | "critical";
  onClick?: () => void;
}

function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  onClick,
}: StatCardProps) {
  const iconColors = {
    default: "bg-primary/10 text-primary",
    warning: "bg-amber-100 text-amber-700",
    critical: "bg-destructive/10 text-destructive",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inventory-card flex items-center gap-3 text-left w-full ${onClick ? "cursor-pointer active:scale-95 transition-smooth" : "cursor-default"}`}
      data-ocid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[variant]}`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-display font-bold text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
      </div>
    </button>
  );
}

interface AlertRowProps {
  alert: ExpiryAlert;
  daysLeft: number;
}

function AlertRow({ alert, daysLeft }: AlertRowProps) {
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft > 0 && daysLeft <= 14;
  // yellow = 15-30 days, red = 0-14 or expired
  const dotClass = isExpired || isUrgent ? "stock-critical" : "stock-warning";
  const badgeClass = isExpired || isUrgent ? "alert-critical" : "alert-warning";

  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-border last:border-0"
      data-ocid="alert-row"
    >
      <span className={`stock-indicator flex-shrink-0 ${dotClass}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {alert.drugName}
        </p>
        <p className="text-xs text-muted-foreground">
          Batch {alert.batchNumber} · {alert.quantity.toString()} units
        </p>
        <p className="text-xs text-muted-foreground">
          Exp: {formatDate(alert.expiryDate)}
        </p>
      </div>
      <span className={`alert-badge text-xs flex-shrink-0 ${badgeClass}`}>
        {isExpired ? "Expired" : `${daysLeft}d`}
      </span>
    </div>
  );
}

interface ExpiryAlertsSummaryProps {
  alerts: ExpiryAlert[];
  onNavigate: (tab: TabRoute) => void;
}

function ExpiryAlertsSummary({ alerts, onNavigate }: ExpiryAlertsSummaryProps) {
  const now = Date.now();
  const expiringSoon = alerts.filter((a) => {
    const ms = msFromNano(a.expiryDate);
    const diff = ms - now;
    return diff > 15 * 24 * 60 * 60 * 1000 && diff <= 30 * 24 * 60 * 60 * 1000;
  });
  const expiredOrUrgent = alerts.filter((a) => {
    const ms = msFromNano(a.expiryDate);
    return ms - now <= 15 * 24 * 60 * 60 * 1000;
  });

  return (
    <button
      type="button"
      onClick={() => onNavigate("alerts")}
      className="w-full bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-4 active:scale-95 transition-smooth text-left"
      data-ocid="expiry-summary-card"
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Expiring Soon
          </span>
          <div className="flex items-center gap-2">
            <span className="alert-badge alert-warning text-xs">
              15-30 days
            </span>
            <span className="text-sm font-display font-bold text-foreground">
              {expiringSoon.length} drugs
            </span>
          </div>
        </div>
      </div>
      <div className="w-px h-10 bg-border flex-shrink-0" />
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Expired Items
          </span>
          <div className="flex items-center gap-2">
            <span className="alert-badge alert-critical text-xs">Expired</span>
            <span className="text-sm font-display font-bold text-foreground">
              {expiredOrUrgent.length} drugs
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

interface BillRowProps {
  bill: Bill;
}

function BillRow({ bill }: BillRowProps) {
  const hasText = !!bill.extractedText;
  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-border last:border-0"
      data-ocid="bill-row"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        {hasText ? (
          <FileText size={16} className="text-primary" />
        ) : (
          <ImageIcon size={16} className="text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {bill.filename}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {bill.note || "No notes added"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(bill.uploadedAt)}
        </span>
        {hasText ? (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 border-emerald-300 text-emerald-700 bg-emerald-50"
          >
            Extracted
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground"
          >
            Pending
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

interface DashboardPageProps {
  onNavigate: (tab: TabRoute) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: alerts, isLoading: alertsLoading } = useExpiryAlerts(30);
  const { data: bills, isLoading: billsLoading } = useListBills();

  const now = Date.now();
  const activeAlerts = alerts?.filter((a) => !a.dismissed) ?? [];
  const expiredAlerts = activeAlerts.filter(
    (a) => msFromNano(a.expiryDate) < now,
  );
  const urgentAlerts = activeAlerts.filter((a) => {
    const diff = msFromNano(a.expiryDate) - now;
    return diff > 0 && diff <= 14 * 24 * 60 * 60 * 1000;
  });
  const totalUrgent = expiredAlerts.length + urgentAlerts.length;

  const recentBills = bills?.slice(-5).reverse() ?? [];

  return (
    <div className="px-4 py-4 space-y-5" data-ocid="dashboard-page">
      {/* Urgent alert banner */}
      {(expiredAlerts.length > 0 || urgentAlerts.length > 0) && (
        <button
          type="button"
          onClick={() => onNavigate("alerts")}
          data-ocid="urgent-alert-banner"
          className="w-full flex items-center gap-3 p-3.5 bg-card rounded-xl border border-destructive/40 shadow-sm active:scale-95 transition-smooth text-left"
        >
          <span className="alert-badge alert-critical text-xs">
            {totalUrgent} Urgent
          </span>
          <span className="flex-1 font-display font-semibold text-destructive text-sm">
            URGENT ALERTS
          </span>
          <AlertTriangle
            size={18}
            className="text-destructive flex-shrink-0 animate-pulse"
            aria-hidden="true"
          />
        </button>
      )}

      {/* Expiry alert count badge  */}
      {activeAlerts.length > 0 && totalUrgent === 0 && (
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl"
          data-ocid="expiry-count-badge"
        >
          <Clock size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold">{activeAlerts.length}</span> drug
            {activeAlerts.length !== 1 ? "s" : ""} expiring within 30 days
          </p>
        </div>
      )}

      {/* Stats grid */}
      <section aria-label="Inventory overview">
        <h2 className="font-display font-bold text-base text-foreground mb-3">
          Inventory Overview
        </h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[72px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total Drugs"
              value={stats?.totalDrugs?.toString() ?? "0"}
              icon={Package}
              onClick={() => onNavigate("inventory")}
            />
            <StatCard
              label="Total Batches"
              value={stats?.totalBatches?.toString() ?? "0"}
              icon={TrendingUp}
              onClick={() => onNavigate("inventory")}
            />
            <StatCard
              label="Expiring Soon"
              value={stats?.expiringSoonCount?.toString() ?? "0"}
              icon={AlertTriangle}
              variant="warning"
              onClick={() => onNavigate("alerts")}
            />
            <StatCard
              label="Low Stock"
              value={stats?.lowStockBatchCount?.toString() ?? "0"}
              icon={LayoutDashboard}
              variant="critical"
              onClick={() => onNavigate("inventory")}
            />
          </div>
        )}
      </section>

      {/* Expiry alerts section */}
      <section aria-label="Expiry alerts">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base text-foreground">
            Expiry Alerts
          </h2>
          {activeAlerts.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate("alerts")}
              className="text-xs text-primary font-medium hover:underline focus-visible:underline"
              data-ocid="view-all-alerts"
            >
              View all
            </button>
          )}
        </div>

        {alertsLoading ? (
          <div className="bg-card rounded-xl border border-border px-4 py-4 space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : activeAlerts.length === 0 ? (
          <div
            className="bg-card rounded-xl border border-border px-4 py-6 text-center"
            data-ocid="no-alerts-empty"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <Package size={18} className="text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-foreground">All clear!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No drugs expiring within 30 days
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Summary strip */}
            <ExpiryAlertsSummary
              alerts={activeAlerts}
              onNavigate={onNavigate}
            />

            {/* Top 3 alerts list */}
            <div className="bg-card rounded-xl border border-border px-4">
              {activeAlerts.slice(0, 3).map((alert) => (
                <AlertRow
                  key={alert.batchId.toString()}
                  alert={alert}
                  daysLeft={daysUntilExpiry(alert.expiryDate)}
                />
              ))}
              {activeAlerts.length > 3 && (
                <button
                  type="button"
                  onClick={() => onNavigate("alerts")}
                  className="w-full py-3 text-xs text-primary font-medium text-center hover:underline focus-visible:underline"
                  data-ocid="show-more-alerts"
                >
                  +{activeAlerts.length - 3} more alerts
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Recent Bills / Uploads */}
      <section aria-label="Recent uploads">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base text-foreground">
            Recent Uploads
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("add")}
            className="text-xs text-primary font-medium hover:underline focus-visible:underline"
            data-ocid="upload-new-bill"
          >
            + Upload
          </button>
        </div>

        {billsLoading ? (
          <div className="bg-card rounded-xl border border-border px-4 py-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : recentBills.length === 0 ? (
          <button
            type="button"
            onClick={() => onNavigate("add")}
            className="w-full bg-card rounded-xl border border-dashed border-primary/30 px-4 py-6 text-center active:scale-95 transition-smooth"
            data-ocid="no-bills-empty"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <FileText size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No bills uploaded yet
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tap to upload a purchase bill photo
            </p>
          </button>
        ) : (
          <div className="bg-card rounded-xl border border-border px-4">
            {recentBills.map((bill) => (
              <BillRow key={bill.id.toString()} bill={bill} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom padding for safe area */}
      <div className="h-2" />
    </div>
  );
}
