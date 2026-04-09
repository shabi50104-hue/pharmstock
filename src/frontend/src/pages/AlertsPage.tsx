import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CalendarX,
  CheckCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDismissAlert, useExpiryAlerts } from "../hooks/useInventory";
import type { ExpiryAlert } from "../types";

function getDaysRemaining(expiryDateNs: bigint): number {
  const expiryMs = Number(expiryDateNs) / 1_000_000;
  return Math.floor((expiryMs - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatExpiryDate(expiryDateNs: bigint): string {
  const date = new Date(Number(expiryDateNs) / 1_000_000);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type AlertSeverity = "warning" | "critical" | "expired";

function getSeverity(days: number): AlertSeverity {
  if (days < 0) return "expired";
  if (days <= 14) return "critical";
  return "warning";
}

function SeverityBadge({ days }: { days: number }) {
  const severity = getSeverity(days);
  if (severity === "expired") {
    return (
      <span
        className="alert-badge alert-critical"
        data-ocid="severity-badge-expired"
      >
        <CalendarX className="w-3.5 h-3.5" />
        Expired
      </span>
    );
  }
  if (severity === "critical") {
    return (
      <span
        className="alert-badge alert-critical"
        data-ocid="severity-badge-critical"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        {days}d left
      </span>
    );
  }
  return (
    <span
      className="alert-badge alert-warning"
      data-ocid="severity-badge-warning"
    >
      <Bell className="w-3.5 h-3.5" />
      {days}d left
    </span>
  );
}

interface AlertCardProps {
  alert: ExpiryAlert;
  onDismiss: (batchId: bigint) => void;
  isDismissing: boolean;
}

function AlertCard({ alert, onDismiss, isDismissing }: AlertCardProps) {
  const days = getDaysRemaining(alert.expiryDate);
  const severity = getSeverity(days);

  const borderClass =
    severity === "warning" ? "border-l-amber-400" : "border-l-red-400";
  const bgClass =
    severity === "warning"
      ? "bg-amber-50/60 dark:bg-amber-950/30"
      : "bg-red-50/60 dark:bg-red-950/30";

  return (
    <div
      className={`relative rounded-xl border border-border border-l-4 ${borderClass} ${bgClass} p-4 transition-smooth`}
      data-ocid="alert-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-display font-bold text-foreground text-base truncate">
              {alert.drugName}
            </h3>
            <SeverityBadge days={days} />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide block">
                Batch No
              </span>
              <p className="text-sm font-semibold text-foreground font-mono">
                {alert.batchNumber}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide block">
                Quantity
              </span>
              <p className="text-sm font-semibold text-foreground">
                {alert.quantity.toString()} units
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide block">
                Expiry Date
              </span>
              <p className="text-sm font-semibold text-foreground">
                {formatExpiryDate(alert.expiryDate)}
                {days < 0 && (
                  <span className="ml-2 text-xs text-red-500 font-normal">
                    ({Math.abs(days)} days ago)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Dismiss alert"
          onClick={() => onDismiss(alert.batchId)}
          disabled={isDismissing}
          data-ocid="alert-dismiss-btn"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function AlertCardSkeleton() {
  return (
    <div className="rounded-xl border border-border border-l-4 border-l-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full col-span-2" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      </div>
    </div>
  );
}

function EmptyAlerts() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-6"
      data-ocid="alerts-empty-state"
    >
      <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-5">
        <CheckCircle className="w-10 h-10 text-emerald-500" />
      </div>
      <h2 className="font-display font-bold text-xl text-foreground mb-2">
        All Clear!
      </h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        No drugs are expiring within 30 days. Your pharmacy stock is in great
        shape.
      </p>
    </div>
  );
}

export function AlertsPage() {
  const { data: alerts, isLoading } = useExpiryAlerts(30);
  const dismiss = useDismissAlert();
  const [dismissingId, setDismissingId] = useState<bigint | null>(null);

  const activeAlerts = (alerts ?? []).filter((a) => !a.dismissed);

  const criticalAlerts = activeAlerts.filter((a) => {
    const days = getDaysRemaining(a.expiryDate);
    return days <= 14;
  });

  const warningAlerts = activeAlerts.filter((a) => {
    const days = getDaysRemaining(a.expiryDate);
    return days > 14 && days <= 30;
  });

  const handleDismiss = (batchId: bigint) => {
    setDismissingId(batchId);
    dismiss.mutate(batchId, {
      onSuccess: () => {
        toast.success("Alert dismissed");
        setDismissingId(null);
      },
      onError: () => {
        toast.error("Failed to dismiss alert");
        setDismissingId(null);
      },
    });
  };

  return (
    <div className="flex-1 bg-background min-h-0" data-ocid="alerts-page">
      {/* Summary Bar */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          {criticalAlerts.length > 0 && (
            <span
              className="alert-badge alert-critical"
              data-ocid="alerts-critical-count"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {criticalAlerts.length} Critical
            </span>
          )}
          {warningAlerts.length > 0 && (
            <span
              className="alert-badge alert-warning"
              data-ocid="alerts-warning-count"
            >
              <Bell className="w-3.5 h-3.5" />
              {warningAlerts.length} Expiring Soon
            </span>
          )}
          {activeAlerts.length === 0 && !isLoading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 font-display text-sm font-semibold dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800">
              <CheckCircle className="w-3.5 h-3.5" />
              No Active Alerts
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <AlertCardSkeleton key={i} />
            ))}
          </div>
        ) : activeAlerts.length === 0 ? (
          <EmptyAlerts />
        ) : (
          <>
            {/* Critical / Expired Section */}
            {criticalAlerts.length > 0 && (
              <section data-ocid="alerts-critical-section">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-red-600 dark:text-red-400">
                    Critical — Act Now
                  </h2>
                  <Badge
                    variant="destructive"
                    className="ml-auto text-xs"
                    data-ocid="critical-badge"
                  >
                    {criticalAlerts.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {criticalAlerts.map((alert) => (
                    <AlertCard
                      key={alert.batchId.toString()}
                      alert={alert}
                      onDismiss={handleDismiss}
                      isDismissing={dismissingId === alert.batchId}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Warning Section */}
            {warningAlerts.length > 0 && (
              <section data-ocid="alerts-warning-section">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    Expiring Soon (15–30 days)
                  </h2>
                  <Badge
                    className="ml-auto text-xs bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800"
                    data-ocid="warning-badge"
                  >
                    {warningAlerts.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {warningAlerts.map((alert) => (
                    <AlertCard
                      key={alert.batchId.toString()}
                      alert={alert}
                      onDismiss={handleDismiss}
                      isDismissing={dismissingId === alert.batchId}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Dismiss hint */}
            <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground text-xs">
              <BellOff className="w-3.5 h-3.5" />
              <span>
                Tap <X className="w-3 h-3 inline" /> to dismiss an alert without
                removing the drug
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
