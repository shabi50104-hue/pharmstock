import { ChevronRight } from "lucide-react";
import type { DrugWithBatches, StockStatus } from "../types";

export function getStockStatus(
  batches: DrugWithBatches["batches"],
): StockStatus {
  if (batches.length === 0) return "low";
  const now = Date.now();
  const hasExpired = batches.some(
    (b) => Number(b.expiryDate) / 1_000_000 < now,
  );
  if (hasExpired) return "expired";
  const hasExpiring = batches.some((b) => {
    const diff = Number(b.expiryDate) / 1_000_000 - now;
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  });
  if (hasExpiring) return "expiring";
  const totalQty = batches.reduce((sum, b) => sum + Number(b.quantity), 0);
  if (totalQty < 20) return "low";
  return "healthy";
}

export function getStatusMeta(status: StockStatus) {
  switch (status) {
    case "healthy":
      return {
        text: "In Stock",
        dot: "stock-healthy",
        label: "text-emerald-700",
      };
    case "low":
      return {
        text: "LOW STOCK",
        dot: "stock-critical",
        label: "text-destructive font-semibold",
      };
    case "expiring":
      return {
        text: "EXPIRING",
        dot: "stock-warning",
        label: "text-amber-700 font-semibold",
      };
    case "expired":
      return {
        text: "EXPIRED",
        dot: "stock-critical",
        label: "text-destructive font-bold",
      };
  }
}

export function formatDateDisplay(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface DrugCardProps {
  item: DrugWithBatches;
  onSelect: (id: bigint) => void;
}

export function DrugCard({ item, onSelect }: DrugCardProps) {
  const { drug, batches } = item;
  const status = getStockStatus(batches);
  const badge = getStatusMeta(status);
  const latestBatch = batches[0];
  const totalQty = batches.reduce((sum, b) => sum + Number(b.quantity), 0);

  return (
    <button
      type="button"
      onClick={() => onSelect(drug.id)}
      data-ocid={`drug-card-${drug.id}`}
      className="inventory-card w-full text-left active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Drug Name</p>
          <p className="font-display font-bold text-foreground text-base leading-tight truncate">
            {drug.name}
          </p>
        </div>
        <ChevronRight
          size={16}
          className="text-muted-foreground flex-shrink-0 mt-4"
        />
      </div>

      <div className="grid grid-cols-3 gap-x-4 mt-3">
        <div>
          <p className="text-xs text-muted-foreground">Batch No</p>
          <p className="font-mono font-semibold text-sm text-foreground truncate">
            {latestBatch?.batchNumber ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Expiry Date</p>
          <p className="font-semibold text-sm text-foreground">
            {latestBatch ? formatDateDisplay(latestBatch.expiryDate) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Current Stock</p>
          <p className="font-bold text-sm text-foreground">{totalQty} units</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground">
          {batches.length} {batches.length === 1 ? "batch" : "batches"}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`stock-indicator ${badge.dot}`} />
          <span className={`text-xs ${badge.label}`}>{badge.text}</span>
        </div>
      </div>
    </button>
  );
}
